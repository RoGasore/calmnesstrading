//+------------------------------------------------------------------+
//|                                            CalmnessFi_EA.mq4      |
//|                        Copyright 2024, Calmness Fi Trading        |
//|                                https://calmnesstrading.vercel.app |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, Calmness Fi Trading"
#property link      "https://calmnesstrading.vercel.app"
#property version   "1.00"
#property strict

// ===================================================================
// PARAMÈTRES D'ENTRÉE
// ===================================================================
input string API_URL = "https://calmnesstrading.onrender.com/api/auth/user/trading/ea/sync/";  // URL de l'API
input string API_KEY = "VOTRE_CLE_API_ICI";  // Votre clé API unique
input int SyncInterval = 60;  // Intervalle de synchronisation (secondes)

// ===================================================================
// VARIABLES GLOBALES
// ===================================================================
datetime lastSyncTime = 0;
string version = "1.00";

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   Print("===================================================");
   Print("Calmness Fi Trading EA - Version ", version);
   Print("===================================================");
   
   // Vérifier que l'API Key est configurée
   if(API_KEY == "VOTRE_CLE_API_ICI" || API_KEY == "")
     {
      Alert("ERREUR: Veuillez configurer votre API KEY dans les paramètres de l'EA!");
      Print("ERROR: API KEY not configured!");
      return(INIT_FAILED);
     }
   
   Print("API URL: ", API_URL);
   Print("API Key configurée: ", StringSubstr(API_KEY, 0, 8), "...");
   Print("Intervalle de sync: ", SyncInterval, " secondes");
   Print("===================================================");
   Print("EA initialisé avec succès!");
   Print("Synchronisation automatique des trades activée.");
   Print("===================================================");
   
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   Print("EA arrêté. Raison: ", reason);
  }

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
   // Synchroniser toutes les SyncInterval secondes
   if(TimeCurrent() - lastSyncTime > SyncInterval)
     {
      SyncAllTrades();
      lastSyncTime = TimeCurrent();
     }
  }

//+------------------------------------------------------------------+
//| Synchroniser tous les trades                                    |
//+------------------------------------------------------------------+
void SyncAllTrades()
  {
   Print("=== Début de synchronisation ===");
   
   // Récupérer les informations du compte
   double accountBalance = AccountBalance();
   double accountEquity = AccountEquity();
   double accountMargin = AccountMargin();
   double accountFreeMargin = AccountFreeMargin();
   
   Print("Compte - Solde: ", accountBalance, " Équité: ", accountEquity);
   
   // Synchroniser tous les trades ouverts
   int totalOrders = OrdersTotal();
   Print("Nombre de trades ouverts: ", totalOrders);
   
   for(int i = 0; i < totalOrders; i++)
     {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
        {
         SendTradeToAPI(
            OrderTicket(),
            OrderSymbol(),
            OrderType(),
            OrderLots(),
            OrderOpenPrice(),
            0,  // Pas de close price (ouvert)
            OrderStopLoss(),
            OrderTakeProfit(),
            OrderClosePrice(),  // Prix actuel
            OrderProfit(),
            OrderSwap(),
            OrderCommission(),
            OrderOpenTime(),
            0,  // Pas de close time (ouvert)
            OrderComment(),
            OrderMagicNumber(),
            accountBalance,
            accountEquity,
            accountMargin,
            accountFreeMargin
         );
        }
     }
   
   // Synchroniser les trades historiques récents (derniers 100)
   int totalHistory = OrdersHistoryTotal();
   int historyCount = 0;
   
   for(int i = totalHistory - 1; i >= 0 && historyCount < 100; i--)
     {
      if(OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
        {
         SendTradeToAPI(
            OrderTicket(),
            OrderSymbol(),
            OrderType(),
            OrderLots(),
            OrderOpenPrice(),
            OrderClosePrice(),
            OrderStopLoss(),
            OrderTakeProfit(),
            OrderClosePrice(),
            OrderProfit(),
            OrderSwap(),
            OrderCommission(),
            OrderOpenTime(),
            OrderCloseTime(),
            OrderComment(),
            OrderMagicNumber(),
            accountBalance,
            accountEquity,
            accountMargin,
            accountFreeMargin
         );
         historyCount++;
        }
     }
   
   Print("=== Synchronisation terminée - ", totalOrders, " ouverts, ", historyCount, " historiques ===");
  }

//+------------------------------------------------------------------+
//| Envoyer un trade à l'API                                        |
//+------------------------------------------------------------------+
void SendTradeToAPI(
   int ticket,
   string symbol,
   int orderType,
   double lots,
   double openPrice,
   double closePrice,
   double stopLoss,
   double takeProfit,
   double currentPrice,
   double profit,
   double swap,
   double commission,
   datetime openTime,
   datetime closeTime,
   string comment,
   int magicNumber,
   double accBalance,
   double accEquity,
   double accMargin,
   double accFreeMargin
)
  {
   string headers = "Content-Type: application/json\r\nX-API-Key: " + API_KEY + "\r\n";
   
   // Construire le JSON
   string json = "{";
   json += "\"ticket\":\"" + IntegerToString(ticket) + "\",";
   json += "\"symbol\":\"" + symbol + "\",";
   json += "\"type\":\"" + (orderType == OP_BUY ? "buy" : "sell") + "\",";
   json += "\"volume\":" + DoubleToString(lots, 2) + ",";
   json += "\"open_price\":" + DoubleToString(openPrice, 5) + ",";
   json += "\"close_price\":" + (closePrice > 0 ? DoubleToString(closePrice, 5) : "null") + ",";
   json += "\"stop_loss\":" + (stopLoss > 0 ? DoubleToString(stopLoss, 5) : "null") + ",";
   json += "\"take_profit\":" + (takeProfit > 0 ? DoubleToString(takeProfit, 5) : "null") + ",";
   json += "\"current_price\":" + DoubleToString(currentPrice, 5) + ",";
   json += "\"profit\":" + DoubleToString(profit, 2) + ",";
   json += "\"swap\":" + DoubleToString(swap, 2) + ",";
   json += "\"commission\":" + DoubleToString(commission, 2) + ",";
   json += "\"open_time\":\"" + TimeToString(openTime, TIME_DATE|TIME_SECONDS) + "\",";
   json += "\"close_time\":" + (closeTime > 0 ? "\"" + TimeToString(closeTime, TIME_DATE|TIME_SECONDS) + "\"" : "null") + ",";
   json += "\"comment\":\"" + comment + "\",";
   json += "\"magic_number\":" + IntegerToString(magicNumber) + ",";
   json += "\"account_balance\":" + DoubleToString(accBalance, 2) + ",";
   json += "\"account_equity\":" + DoubleToString(accEquity, 2) + ",";
   json += "\"account_margin\":" + DoubleToString(accMargin, 2) + ",";
   json += "\"account_free_margin\":" + DoubleToString(accFreeMargin, 2) + ",";
   json += "\"ea_version\":\"" + version + "\"";
   json += "}";
   
   // Envoyer la requête HTTP
   char post[];
   char result[];
   string resultHeaders;
   
   ArrayResize(post, StringToCharArray(json, post, 0, WHOLE_ARRAY) - 1);
   
   int res = WebRequest("POST", API_URL, headers, 5000, post, result, resultHeaders);
   
   if(res == -1)
     {
      Print("Erreur d'envoi pour trade #", ticket, " - Code: ", GetLastError());
     }
   else
     {
      string response = CharArrayToString(result);
      // Print("Trade #", ticket, " envoyé - Réponse: ", response);  // Décommenter pour debug
     }
  }

//+------------------------------------------------------------------+

