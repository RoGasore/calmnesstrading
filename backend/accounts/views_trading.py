from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Sum, Avg, Count
from datetime import datetime, timedelta
from .models import TradingAccount, Trade, TradingStatistics
import json

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])  # L'EA utilise l'API key pour l'auth
def receive_trade_from_ea(request):
    """
    Recevoir un trade depuis l'Expert Advisor MetaTrader
    Header requis: X-API-Key
    """
    api_key = request.headers.get('X-API-Key')
    
    if not api_key:
        return Response({'error': 'API Key manquante'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        trading_account = TradingAccount.objects.get(api_key=api_key)
    except TradingAccount.DoesNotExist:
        return Response({'error': 'API Key invalide'}, status=status.HTTP_401_UNAUTHORIZED)
    
    data = request.data
    
    # Mise à jour du compte
    if 'account_balance' in data:
        trading_account.balance = data['account_balance']
    if 'account_equity' in data:
        trading_account.equity = data['account_equity']
    if 'account_margin' in data:
        trading_account.margin = data['account_margin']
    if 'account_free_margin' in data:
        trading_account.free_margin = data['account_free_margin']
    
    trading_account.last_sync_at = timezone.now()
    trading_account.ea_installed = True
    if 'ea_version' in data:
        trading_account.ea_version = data['ea_version']
    trading_account.save()
    
    # Créer ou mettre à jour le trade
    ticket = str(data.get('ticket'))
    
    trade, created = Trade.objects.update_or_create(
        trading_account=trading_account,
        ticket=ticket,
        defaults={
            'user': trading_account.user,
            'magic_number': data.get('magic_number'),
            'symbol': data.get('symbol'),
            'trade_type': 'buy' if data.get('type', '').lower() in ['buy', '0'] else 'sell',
            'volume': data.get('volume', 0),
            'open_price': data.get('open_price'),
            'close_price': data.get('close_price') if data.get('close_price') else None,
            'stop_loss': data.get('stop_loss'),
            'take_profit': data.get('take_profit'),
            'current_price': data.get('current_price'),
            'profit': data.get('profit', 0),
            'swap': data.get('swap', 0),
            'commission': data.get('commission', 0),
            'open_time': datetime.fromisoformat(data.get('open_time').replace('Z', '+00:00')),
            'close_time': datetime.fromisoformat(data.get('close_time').replace('Z', '+00:00')) if data.get('close_time') else None,
            'status': 'closed' if data.get('close_time') else 'open',
            'comment': data.get('comment', ''),
        }
    )
    
    return Response({
        'success': True,
        'trade_id': trade.id,
        'created': created,
        'message': 'Trade enregistré avec succès'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trading_accounts_list(request):
    """Liste des comptes de trading de l'utilisateur"""
    accounts = TradingAccount.objects.filter(user=request.user)
    
    accounts_data = []
    for account in accounts:
        accounts_data.append({
            'id': account.id,
            'api_key': str(account.api_key),
            'account_number': account.account_number,
            'account_name': account.account_name,
            'platform': account.platform,
            'account_type': account.account_type,
            'broker_name': account.broker_name,
            'currency': account.currency,
            'balance': float(account.balance),
            'equity': float(account.equity),
            'is_active': account.is_active,
            'ea_installed': account.ea_installed,
            'ea_version': account.ea_version,
            'last_sync_at': account.last_sync_at,
        })
    
    return Response({'accounts': accounts_data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_trading_account(request):
    """Créer un nouveau compte de trading"""
    data = request.data
    
    account = TradingAccount.objects.create(
        user=request.user,
        account_number=data.get('account_number'),
        platform=data.get('platform', 'mt4'),
        account_type=data.get('account_type', 'demo'),
        broker_name=data.get('broker_name'),
        account_name=data.get('account_name', f"Compte {data.get('account_number')}"),
        currency=data.get('currency', 'USD'),
        leverage=data.get('leverage', 100),
    )
    
    return Response({
        'success': True,
        'account_id': account.id,
        'api_key': str(account.api_key),
        'message': 'Compte créé avec succès. Copiez l\'API Key pour configurer votre EA.'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trading_history(request):
    """
    Historique des trades avec filtres avancés
    """
    user = request.user
    
    # Filtres
    period = request.GET.get('period', 'all')  # all, month, week, custom
    trade_status = request.GET.get('status', 'all')  # all, open, closed
    result_filter = request.GET.get('result', 'all')  # all, profit, loss
    symbol_filter = request.GET.get('symbol', None)
    account_id = request.GET.get('account', None)
    
    # Date personnalisée
    start_date = request.GET.get('start_date', None)
    end_date = request.GET.get('end_date', None)
    
    # Query de base
    trades = Trade.objects.filter(user=user)
    
    # Filtre par compte
    if account_id:
        trades = trades.filter(trading_account_id=account_id)
    
    # Filtre par statut
    if trade_status != 'all':
        trades = trades.filter(status=trade_status)
    
    # Filtre par résultat
    if result_filter == 'profit':
        trades = trades.filter(profit__gt=0)
    elif result_filter == 'loss':
        trades = trades.filter(profit__lt=0)
    
    # Filtre par symbole
    if symbol_filter:
        trades = trades.filter(symbol=symbol_filter)
    
    # Filtre par période
    now = timezone.now()
    if period == 'month':
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        trades = trades.filter(open_time__gte=start)
    elif period == 'week':
        start = now - timedelta(days=now.weekday())
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
        trades = trades.filter(open_time__gte=start)
    elif period == 'custom' and start_date and end_date:
        trades = trades.filter(
            open_time__gte=start_date,
            open_time__lte=end_date
        )
    
    # Limiter les résultats
    trades = trades.select_related('trading_account')[:1000]
    
    # Préparer les données
    trades_data = []
    for trade in trades:
        trades_data.append({
            'id': trade.id,
            'ticket': trade.ticket,
            'symbol': trade.symbol,
            'type': trade.trade_type,
            'volume': float(trade.volume),
            'open_price': float(trade.open_price),
            'close_price': float(trade.close_price) if trade.close_price else None,
            'current_price': float(trade.current_price) if trade.current_price else None,
            'stop_loss': float(trade.stop_loss) if trade.stop_loss else None,
            'take_profit': float(trade.take_profit) if trade.take_profit else None,
            'profit': float(trade.profit),
            'swap': float(trade.swap),
            'commission': float(trade.commission),
            'open_time': trade.open_time,
            'close_time': trade.close_time,
            'status': trade.status,
            'duration_minutes': trade.duration_minutes(),
            'account_name': trade.trading_account.account_name,
            'user_notes': trade.user_notes,
        })
    
    # Calculer les statistiques
    total_profit = sum(float(t['profit']) for t in trades_data if t['profit'] > 0)
    total_loss = abs(sum(float(t['profit']) for t in trades_data if t['profit'] < 0))
    net_profit = sum(float(t['profit']) for t in trades_data)
    winning_trades = len([t for t in trades_data if t['profit'] > 0])
    losing_trades = len([t for t in trades_data if t['profit'] < 0])
    total_trades = len(trades_data)
    
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    profit_factor = (total_profit / total_loss) if total_loss > 0 else 0
    
    return Response({
        'trades': trades_data,
        'stats': {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'total_profit': total_profit,
            'total_loss': total_loss,
            'net_profit': net_profit,
            'win_rate': round(win_rate, 2),
            'profit_factor': round(profit_factor, 2),
        },
        'filters_applied': {
            'period': period,
            'status': trade_status,
            'result': result_filter,
            'symbol': symbol_filter,
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_api_key(request, account_id):
    """Régénérer l'API key d'un compte"""
    try:
        account = TradingAccount.objects.get(id=account_id, user=request.user)
        new_key = account.regenerate_api_key()
        
        return Response({
            'success': True,
            'new_api_key': str(new_key),
            'message': 'API Key régénérée. Mettez à jour votre EA avec cette nouvelle clé.'
        })
    except TradingAccount.DoesNotExist:
        return Response({'error': 'Compte non trouvé'}, status=status.HTTP_404_NOT_FOUND)

