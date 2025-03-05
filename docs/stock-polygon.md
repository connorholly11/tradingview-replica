Authentication
Pass your API key in the query string like follows:
https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-09/2023-01-09?apiKey=v0hldwUdqQIRWo1J1_3W1nFSUppESO7N
Copy
Alternatively, you can add an Authorization header to the request with your API Key as the token in the following form:
Authorization: Bearer v0hldwUdqQIRWo1J1_3W1nFSUppESO7N
Copy
Usage
Many of Polygon.io's REST endpoints allow you to extend query parameters with inequalities like date.lt=2023-01-01 (less than) and date.gte=2023-01-01 (greater than or equal to) to search ranges of values. You can also use the field name without any extension to query for exact equality. Fields that support extensions will have an "Additional filter parameters" dropdown beneath them in the docs that detail the supported extensions for that parameter.
Response Types
By default, all endpoints return a JSON response. Users with Stocks Starter plan and above can request a CSV response by including 'Accept': 'text/csv' as a request parameter.
Your Plan
Stocks Advanced

Unlimited API Calls

Real-time Data

15+ Years Historical Data
Manage Subscription
Client Libraries
￼
Python
client-python
￼
Go
client-go
￼
Javascript
client-js
￼
PHP
client-php
￼
Kotlin
client-jvm

Aggregates (Bars)
GET
/v2/aggs/ticker/{stocksTicker}/range/{multiplier}/{timespan}/{from}/{to}
Get aggregate bars for a stock over a given date range in custom time window sizes.   For example, if timespan = ‘minute’ and multiplier = ‘5’ then 5-minute bars will be returned.
Parameters
stocksTicker
*
AAPL
Specify a case-sensitive ticker symbol. For example, AAPL represents Apple Inc.
multiplier
*

The size of the timespan multiplier.
timespan
*
day

The size of the time window.
from
*
2023-01-09
The start of the aggregate time window. Either a date with the format YYYY-MM-DD or a millisecond timestamp.
to
*
2023-02-10
The end of the aggregate time window. Either a date with the format YYYY-MM-DD or a millisecond timestamp.
adjusted
true

Whether or not the results are adjusted for splits. By default, results are adjusted. Set this to false to get results that are NOT adjusted for splits.
sort
asc

Sort the results by timestamp. asc will return results in ascending order (oldest at the top), desc will return results in descending order (newest at the top).
limit

Limits the number of base aggregates queried to create the aggregate results. Max 50000 and Default 5000. Read more about how limit is used to calculate aggregate results in our article on Aggregate Data API Improvements.
https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-09/2023-02-10?adjusted=true&sort=asc&apiKey=v0hldwUdqQIRWo1J1_3W1nFSUppESO7N
Copy
JSON

Run Query
Response Attributes
ticker*string
The exchange symbol that this item is traded under.

adjusted*boolean
Whether or not this response was adjusted for splits.

queryCount*integer
The number of aggregates (minute or day) used to generate the response.

request_id*string
A request id assigned by the server.

resultsCount*integer
The total number of results for this request.

status*string
The status of this request's response.

resultsarray

c*number
The close price for the symbol in the given time period.

h*number
The highest price for the symbol in the given time period.

l*number
The lowest price for the symbol in the given time period.

ninteger
The number of transactions in the aggregate window.

o*number
The open price for the symbol in the given time period.

otcboolean
Whether or not this aggregate is for an OTC ticker. This field will be left off if false.

t*integer
The Unix Msec timestamp for the start of the aggregate window.

v*number
The trading volume of the symbol in the given time period.

vwnumber
The volume weighted average price.

next_urlstring
If present, this value can be used to fetch the next page of data.

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "adjusted": true,
  "next_url": "https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/1578114000000/2020-01-10?cursor=bGltaXQ9MiZzb3J0PWFzYw",
  "queryCount": 2,
  "request_id": "6a7e466379af0a71039d60cc78e72282",
  "results": [
    {
      "c": 75.0875,
      "h": 75.15,
      "l": 73.7975,
      "n": 1,
      "o": 74.06,
      "t": 1577941200000,
      "v": 135647456,
      "vw": 74.6099
    },
    {
      "c": 74.3575,
      "h": 75.145,
      "l": 74.125,
      "n": 1,
      "o": 74.2875,
      "t": 1578027600000,
      "v": 146535512,
      "vw": 74.7026
    }
  ],
  "resultsCount": 2,
  "status": "OK",
  "ticker": "AAPL"
}

Grouped Daily (Bars)
GET
/v2/aggs/grouped/locale/us/market/stocks/{date}
Get the daily open, high, low, and close (OHLC) for the entire stocks/equities markets.
Parameters
date
*
2023-01-09
The beginning date for the aggregate window.
adjusted
true

Whether or not the results are adjusted for splits. By default, results are adjusted. Set this to false to get results that are NOT adjusted for splits.
include_otc


Include OTC securities in the response. Default is false (don't include OTC securities).
https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/2023-01-09?adjusted=true&apiKey=v0hldwUdqQIRWo1J1_3W1nFSUppESO7N
Copy
JSON

Run Query
Response Attributes
adjusted*boolean
Whether or not this response was adjusted for splits.

queryCount*integer
The number of aggregates (minute or day) used to generate the response.

request_id*string
A request id assigned by the server.

resultsCount*integer
The total number of results for this request.

status*string
The status of this request's response.

resultsarray

T*string
The exchange symbol that this item is traded under.

c*number
The close price for the symbol in the given time period.

h*number
The highest price for the symbol in the given time period.

l*number
The lowest price for the symbol in the given time period.

ninteger
The number of transactions in the aggregate window.

o*number
The open price for the symbol in the given time period.

otcboolean
Whether or not this aggregate is for an OTC ticker. This field will be left off if false.

t*integer
The Unix Msec timestamp for the end of the aggregate window.

v*number
The trading volume of the symbol in the given time period.

vwnumber
The volume weighted average price.

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "adjusted": true,
  "queryCount": 3,
  "results": [
    {
      "T": "KIMpL",
      "c": 25.9102,
      "h": 26.25,
      "l": 25.91,
      "n": 74,
      "o": 26.07,
      "t": 1602705600000,
      "v": 4369,
      "vw": 26.0407
    },
    {
      "T": "TANH",
      "c": 23.4,
      "h": 24.763,
      "l": 22.65,
      "n": 1096,
      "o": 24.5,
      "t": 1602705600000,
      "v": 25933.6,
      "vw": 23.493
    },
    {
      "T": "VSAT",
      "c": 34.24,
      "h": 35.47,
      "l": 34.21,
      "n": 4966,
      "o": 34.9,
      "t": 1602705600000,
      "v": 312583,
      "vw": 34.4736
    }
  ],
  "resultsCount": 3,
  "status": "OK"
}

Daily Open/Close
GET
/v1/open-close/{stocksTicker}/{date}
Get the open, close and afterhours prices of a stock symbol on a certain date.
Parameters
stocksTicker
*
AAPL
Specify a case-sensitive ticker symbol. For example, AAPL represents Apple Inc.
date
*


The date of the requested open/close in the format YYYY-MM-DD.
adjusted
true

Whether or not the results are adjusted for splits. By default, results are adjusted. Set this to false to get results that are NOT adjusted for splits.
https://api.polygon.io/v1/open-close/AAPL/2023-01-09?adjusted=true&apiKey=v0hldwUdqQIRWo1J1_3W1nFSUppESO7N
Copy
JSON

Run Query
Response Attributes
afterHoursnumber
The close price of the ticker symbol in after hours trading.

close*number
The close price for the symbol in the given time period.

from*string
The requested date.

high*number
The highest price for the symbol in the given time period.

low*number
The lowest price for the symbol in the given time period.

open*number
The open price for the symbol in the given time period.

otcboolean
Whether or not this aggregate is for an OTC ticker. This field will be left off if false.

preMarketinteger
The open price of the ticker symbol in pre-market trading.

status*string
The status of this request's response.

symbol*string
The exchange symbol that this item is traded under.

volume*number
The trading volume of the symbol in the given time period.

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "afterHours": 322.1,
  "close": 325.12,
  "from": "2023-01-09",
  "high": 326.2,
  "low": 322.3,
  "open": 324.66,
  "preMarket": 324.5,
  "status": "OK",
  "symbol": "AAPL",
  "volume": 26122646
}

Previous Close
GET
/v2/aggs/ticker/{stocksTicker}/prev
Get the previous day's open, high, low, and close (OHLC) for the specified stock ticker.
Parameters
stocksTicker
*
AAPL
Specify a case-sensitive ticker symbol. For example, AAPL represents Apple Inc.
adjusted
true

Whether or not the results are adjusted for splits. By default, results are adjusted. Set this to false to get results that are NOT adjusted for splits.
https://api.polygon.io/v2/aggs/ticker/AAPL/prev?adjusted=true&apiKey=v0hldwUdqQIRWo1J1_3W1nFSUppESO7N
Copy
JSON

Run Query
Response Attributes
ticker*string
The exchange symbol that this item is traded under.

adjusted*boolean
Whether or not this response was adjusted for splits.

queryCount*integer
The number of aggregates (minute or day) used to generate the response.

request_id*string
A request id assigned by the server.

resultsCount*integer
The total number of results for this request.

status*string
The status of this request's response.

resultsarray

c*number
The close price for the symbol in the given time period.

h*number
The highest price for the symbol in the given time period.

l*number
The lowest price for the symbol in the given time period.

ninteger
The number of transactions in the aggregate window.

o*number
The open price for the symbol in the given time period.

t*integer
The Unix Msec timestamp for the start of the aggregate window.

v*number
The trading volume of the symbol in the given time period.

vwnumber
The volume weighted average price.

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "adjusted": true,
  "queryCount": 1,
  "request_id": "6a7e466379af0a71039d60cc78e72282",
  "results": [
    {
      "T": "AAPL",
      "c": 115.97,
      "h": 117.59,
      "l": 114.13,
      "o": 115.55,
      "t": 1605042000000,
      "v": 131704427,
      "vw": 116.3058
    }
  ],
  "resultsCount": 1,
  "status": "OK",
  "ticker": "AAPL"
}

Trades
GET
/v3/trades/{stockTicker}
Get trades for a ticker symbol in a given time range.
Parameters
stockTicker
*
AAPL
The ticker symbol to get trades for.
timestamp

Query by trade timestamp. Either a date with the format YYYY-MM-DD or a nanosecond timestamp.
Additional filter parameters

timestamp.gtgreater than
timestamp.gtegreater than or equal to
timestamp.ltless than
timestamp.lteless than or equal to
Learn More
order


Order results based on the sort field.
limit

Limit the number of results returned, default is 1000 and max is 50000.
sort


Sort field used for ordering.
https://api.polygon.io/v3/trades/AAPL?limit=1000&apiKey=v0hldwUdqQIRWo1J1_3W1nFSUppESO7N
Copy
JSON

Run Query
Response Attributes
next_urlstring
If present, this value can be used to fetch the next page of data.

resultsarray

conditionsarray [integer]
A list of condition codes.

correctioninteger
The trade correction indicator.

exchange*integer
The exchange ID. See Exchanges for Polygon.io's mapping of exchange IDs.

id*string
The Trade ID which uniquely identifies a trade. These are unique per combination of ticker, exchange, and TRF. For example: A trade for AAPL executed on NYSE and a trade for AAPL executed on NASDAQ could potentially have the same Trade ID.

participant_timestamp*integer
The nanosecond accuracy Participant/Exchange Unix Timestamp. This is the timestamp of when the trade was actually generated at the exchange.

price*number
The price of the trade. This is the actual dollar value per whole share of this trade. A trade of 100 shares with a price of $2.00 would be worth a total dollar value of $200.00.

sequence_number*integer
The sequence number represents the sequence in which trade events happened. These are increasing and unique per ticker symbol, but will not always be sequential (e.g., 1, 2, 6, 9, 10, 11). Values reset after each trading session/day.

sip_timestamp*integer
The nanosecond accuracy SIP Unix Timestamp. This is the timestamp of when the SIP received this trade from the exchange which produced it.

size*number
The size of a trade (also known as volume).

tapeinteger
There are 3 tapes which define which exchange the ticker is listed on. These are integers in our objects which represent the letter of the alphabet. Eg: 1 = A, 2 = B, 3 = C.
* 		Tape A is NYSE listed securities
* 		Tape B is NYSE ARCA / NYSE American
* 		Tape C is NASDAQ

trf_idinteger
The ID for the Trade Reporting Facility where the trade took place.

trf_timestampinteger
The nanosecond accuracy TRF (Trade Reporting Facility) Unix Timestamp. This is the timestamp of when the trade reporting facility received this trade.

status*string
The status of this request's response.

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "next_url": "https://api.polygon.io/v3/trades/AAPL?cursor=YWN0aXZlPXRydWUmZGF0ZT0yMDIxLTA0LTI1JmxpbWl0PTEmb3JkZXI9YXNjJnBhZ2VfbWFya2VyPUElN0M5YWRjMjY0ZTgyM2E1ZjBiOGUyNDc5YmZiOGE1YmYwNDVkYzU0YjgwMDcyMWE2YmI1ZjBjMjQwMjU4MjFmNGZiJnNvcnQ9dGlja2Vy",
  "request_id": "a47d1beb8c11b6ae897ab76cdbbf35a3",
  "results": [
    {
      "conditions": [
        12,
        41
      ],
      "exchange": 11,
      "id": "1",
      "participant_timestamp": 1517562000015577000,
      "price": 171.55,
      "sequence_number": 1063,
      "sip_timestamp": 1517562000016036600,
      "size": 100,
      "tape": 3
    },
    {
      "conditions": [
        12,
        41
      ],
      "exchange": 11,
      "id": "2",
      "participant_timestamp": 1517562000015577600,
      "price": 171.55,
      "sequence_number": 1064,
      "sip_timestamp": 1517562000016038100,
      "size": 100,
      "tape": 3
    }
  ],
  "status": "OK"
}

Last Trade
GET
/v2/last/trade/{stocksTicker}
Get the most recent trade for a given stock.
Parameters
stocksTicker
*
AAPL
The ticker symbol of the stock/equity.
https://api.polygon.io/v2/last/trade/AAPL?apiKey=v0hldwUdqQIRWo1J1_3W1nFSUppESO7N
Copy
JSON

Run Query
Response Attributes
request_id*string
A request id assigned by the server.

resultsobject

T*string
The exchange symbol that this item is traded under.

carray [integer]
A list of condition codes.

einteger
The trade correction indicator.

finteger
The nanosecond accuracy TRF(Trade Reporting Facility) Unix Timestamp. This is the timestamp of when the trade reporting facility received this message.

i*string
The Trade ID which uniquely identifies a trade. These are unique per combination of ticker, exchange, and TRF. For example: A trade for AAPL executed on NYSE and a trade for AAPL executed on NASDAQ could potentially have the same Trade ID.

p*number
The price of the trade. This is the actual dollar value per whole share of this trade. A trade of 100 shares with a price of $2.00 would be worth a total dollar value of $200.00.

q*integer
The sequence number represents the sequence in which message events happened. These are increasing and unique per ticker symbol, but will not always be sequential (e.g., 1, 2, 6, 9, 10, 11).

rinteger
The ID for the Trade Reporting Facility where the trade took place.

snumber
The size of a trade (also known as volume).

t*integer
The nanosecond accuracy SIP Unix Timestamp. This is the timestamp of when the SIP received this message from the exchange which produced it.

x*integer
The exchange ID. See Exchanges for Polygon.io's mapping of exchange IDs.

y*integer
The nanosecond accuracy Participant/Exchange Unix Timestamp. This is the timestamp of when the quote was actually generated at the exchange.

zinteger
There are 3 tapes which define which exchange the ticker is listed on. These are integers in our objects which represent the letter of the alphabet. Eg: 1 = A, 2 = B, 3 = C.
* 		Tape A is NYSE listed securities
* 		Tape B is NYSE ARCA / NYSE American
* 		Tape C is NASDAQ

status*string
The status of this request's response.

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "request_id": "f05562305bd26ced64b98ed68b3c5d96",
  "results": {
    "T": "AAPL",
    "c": [
      37
    ],
    "f": 1617901342969796400,
    "i": "118749",
    "p": 129.8473,
    "q": 3135876,
    "r": 202,
    "s": 25,
    "t": 1617901342969834000,
    "x": 4,
    "y": 1617901342968000000,
    "z": 3
  },
  "status": "OK"
}

Quotes (NBBO)
GET
/v3/quotes/{stockTicker}
Get NBBO quotes for a ticker symbol in a given time range.
Parameters
stockTicker
*
AAPL
The ticker symbol to get quotes for.
timestamp

Query by timestamp. Either a date with the format YYYY-MM-DD or a nanosecond timestamp.
Additional filter parameters

timestamp.gtgreater than
timestamp.gtegreater than or equal to
timestamp.ltless than
timestamp.lteless than or equal to
Learn More
order


Order results based on the sort field.
limit

Limit the number of results returned, default is 1000 and max is 50000.
sort


Sort field used for ordering.
https://api.polygon.io/v3/quotes/AAPL?limit=1000&apiKey=v0hldwUdqQIRWo1J1_3W1nFSUppESO7N
Copy
JSON

Run Query
Response Attributes
next_urlstring
If present, this value can be used to fetch the next page of data.

resultsarray

ask_exchangeinteger
The ask exchange ID

ask_pricenumber
The ask price.

ask_sizenumber
The ask size. This represents the number of round lot orders at the given ask price. The normal round lot size is 100 shares. An ask size of 2 means there are 200 shares available to purchase at the given ask price.

bid_exchangeinteger
The bid exchange ID

bid_pricenumber
The bid price.

bid_sizenumber
The bid size. This represents the number of round lot orders at the given bid price. The normal round lot size is 100 shares. A bid size of 2 means there are 200 shares for purchase at the given bid price.

conditionsarray [integer]
A list of condition codes.

indicatorsarray [integer]
A list of indicator codes.

participant_timestamp*integer
The nanosecond accuracy Participant/Exchange Unix Timestamp. This is the timestamp of when the quote was actually generated at the exchange.

sequence_number*integer
The sequence number represents the sequence in which quote events happened. These are increasing and unique per ticker symbol, but will not always be sequential (e.g., 1, 2, 6, 9, 10, 11). Values reset after each trading session/day.

sip_timestamp*integer
The nanosecond accuracy SIP Unix Timestamp. This is the timestamp of when the SIP received this quote from the exchange which produced it.

tapeinteger
There are 3 tapes which define which exchange the ticker is listed on. These are integers in our objects which represent the letter of the alphabet. Eg: 1 = A, 2 = B, 3 = C.
* 		Tape A is NYSE listed securities
* 		Tape B is NYSE ARCA / NYSE American
* 		Tape C is NASDAQ

trf_timestampinteger
The nanosecond accuracy TRF (Trade Reporting Facility) Unix Timestamp. This is the timestamp of when the trade reporting facility received this quote.

status*string
The status of this request's response.

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "next_url": "https://api.polygon.io/v3/quotes/AAPL?cursor=YWN0aXZlPXRydWUmZGF0ZT0yMDIxLTA0LTI1JmxpbWl0PTEmb3JkZXI9YXNjJnBhZ2VfbWFya2VyPUElN0M5YWRjMjY0ZTgyM2E1ZjBiOGUyNDc5YmZiOGE1YmYwNDVkYzU0YjgwMDcyMWE2YmI1ZjBjMjQwMjU4MjFmNGZiJnNvcnQ9dGlja2Vy",
  "request_id": "a47d1beb8c11b6ae897ab76cdbbf35a3",
  "results": [
    {
      "ask_exchange": 0,
      "ask_price": 0,
      "ask_size": 0,
      "bid_exchange": 11,
      "bid_price": 102.7,
      "bid_size": 60,
      "conditions": [
        1
      ],
      "participant_timestamp": 1517562000065321200,
      "sequence_number": 2060,
      "sip_timestamp": 1517562000065700400,
      "tape": 3
    },
    {
      "ask_exchange": 0,
      "ask_price": 0,
      "ask_size": 0,
      "bid_exchange": 11,
      "bid_price": 170,
      "bid_size": 2,
      "conditions": [
        1
      ],
      "participant_timestamp": 1517562000065408300,
      "sequence_number": 2061,
      "sip_timestamp": 1517562000065791500,
      "tape": 3
    }
  ],
  "status": "OK"
}

Last Quote
GET
/v2/last/nbbo/{stocksTicker}
Get the most recent NBBO (Quote) tick for a given stock.
Parameters
stocksTicker
*
AAPL
The ticker symbol of the stock/equity.
https://api.polygon.io/v2/last/nbbo/AAPL?apiKey=v0hldwUdqQIRWo1J1_3W1nFSUppESO7N
Copy
JSON

Run Query
Response Attributes
request_id*string
A request id assigned by the server.

resultsobject

Pnumber
The ask price.

Sinteger
The ask size. This represents the number of round lot orders at the given ask price. The normal round lot size is 100 shares. An ask size of 2 means there are 200 shares available to purchase at the given ask price.

T*string
The exchange symbol that this item is traded under.

Xinteger
The exchange ID. See Exchanges for Polygon.io's mapping of exchange IDs.

carray [integer]
A list of condition codes.

finteger
The nanosecond accuracy TRF(Trade Reporting Facility) Unix Timestamp. This is the timestamp of when the trade reporting facility received this message.

iarray [integer]
A list of indicator codes.

pnumber
The bid price.

q*integer
The sequence number represents the sequence in which message events happened. These are increasing and unique per ticker symbol, but will not always be sequential (e.g., 1, 2, 6, 9, 10, 11).

sinteger
The bid size. This represents the number of round lot orders at the given bid price. The normal round lot size is 100 shares. A bid size of 2 means there are 200 shares for purchase at the given bid price.

t*integer
The nanosecond accuracy SIP Unix Timestamp. This is the timestamp of when the SIP received this message from the exchange which produced it.

xinteger
The exchange ID. See Exchanges for Polygon.io's mapping of exchange IDs.

y*integer
The nanosecond accuracy Participant/Exchange Unix Timestamp. This is the timestamp of when the quote was actually generated at the exchange.

zinteger
There are 3 tapes which define which exchange the ticker is listed on. These are integers in our objects which represent the letter of the alphabet. Eg: 1 = A, 2 = B, 3 = C.
* 		Tape A is NYSE listed securities
* 		Tape B is NYSE ARCA / NYSE American
* 		Tape C is NASDAQ

status*string
The status of this request's response.

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "request_id": "b84e24636301f19f88e0dfbf9a45ed5c",
  "results": {
    "P": 127.98,
    "S": 7,
    "T": "AAPL",
    "X": 19,
    "p": 127.96,
    "q": 83480742,
    "s": 1,
    "t": 1617827221349730300,
    "x": 11,
    "y": 1617827221349366000,
    "z": 3
  },
  "status": "OK"
}     Stocks WebSocket Documentation
The Polygon.io Stocks WebSocket API provides streaming access to the latest stock market data from all US stock exchanges. You can specify which channels you want to consume by sending instructions in the form of actions. Our WebSockets emit events to notify you when an event has occurred in a channel you've subscribed to.
Our WebSocket APIs are based on entitlements that control which WebSocket Clusters you can connect to and which kinds of data you can access. Examples in these docs include your API key, which only you can see, and are personalized based on your entitlements.
Step 1: Connect
Your current plan includes 1 connection to wss://socket.polygon.io/stocks. If you attempt additional connections, the existing connection will be disconnected. If you need more simultaneous connections to this cluster, you can contact support.
Connecting to a cluster:
Real-time:wscat -c wss://socket.polygon.io/stocks
Copy
On connection you will receive the following message:
[{
	"ev":"status",
	"status":"connected",
	"message": "Connected Successfully"
}]
Step 2: Authenticate
You must authenticate before you can make any other requests.
{"action":"auth","params":"v0hldwUdqQIRWo1J1_3W1nFSUppESO7N"}
Copy
On successful authentication you will receive the following message:
[{
	"ev":"status",
	"status":"auth_success",
	"message": "authenticated"
}]
Step 3: Subscribe
Once authenticated, you can request a stream. You can request multiple streams in the same request.
{"action":"subscribe","params":"AM.LPL"}
Copy
You can also request multiple streams from the same cluster.
{"action":"subscribe","params":"AM.LPL,AM.MSFT"}
Copy
Usage
Things happen very quickly in the world of finance, which means a Polygon.io WebSocket client must be able to handle many incoming messages per second. Due to the nature of the WebSocket protocol, if a client is slow to consume messages from the server, Polygon.io's server must buffer messages and send them only as fast as the client can consume them. To help prevent the message buffer from getting too long, Polygon.io may send more than one JSON object in a single WebSocket message. We accomplish this by wrapping all messages in a JSON array, and adding more objects to the array if the message buffer is getting longer. For example, consider a WebSocket message with a single trade event in it:
[
    {"ev":"T","sym":"MSFT","i":"50578","x":4,"p":215.9721,"s":100,"t":1611082428813,"z":3}
]
If your client is consuming a bit slow, or 2+ events happened in very short succession, you may receive a single WebSocket message with more than one event inside it, like this:
[
    {"ev":"T","sym":"MSFT","i":"50578","x":4,"p":215.9721,"s":100,"t":1611082428813,"z":3}, 
    {"ev":"T","sym":"MSFT","i":"12856","x":4,"p":215.989,"s":1,"c":[37],"t":1611082428814,"z":3}
]
Note that if a client is consuming messages too slowly for too long, Polygon.io's server-side buffer may get too large. If that happens, Polygon.io will terminate the WebSocket connection. You can check your account dashboard to see if a connection was terminated as a slow consumer. If this happens to you consistently, consider subscribing to fewer symbols or channels.
Your Plan
Stocks Advanced

Real-time Data

1 Stocks Cluster Connection
Manage Subscription
Client Libraries
￼
Python
client-python
￼
Go
client-go
￼
Javascript
client-js
￼
PHP
client-php
￼
Kotlin
client-jvm

Aggregates (Per Minute)
WS
Real-Time:wss://socket.polygon.io/stocks
Stream real-time minute aggregates for a given stock ticker symbol.
Parameters
ticker
*
*
Specify a stock ticker or use * to subscribe to all stock tickers. You can also use a comma separated list to subscribe to multiple stock tickers. You can retrieve available stock tickers from our Stock Tickers API.
{"action":"subscribe", "params":"AM.*"}
Copy
Response Attributes
evenum [AM]
The event type.

symstring
The ticker symbol for the given stock.

vinteger
The tick volume.

avinteger
Today's accumulated volume.

opnumber
Today's official opening price.

vwnumber
The tick's volume weighted average price.

onumber
The opening tick price for this aggregate window.

cnumber
The closing tick price for this aggregate window.

hnumber
The highest tick price for this aggregate window.

lnumber
The lowest tick price for this aggregate window.

anumber
Today's volume weighted average price.

zinteger
The average trade size for this aggregate window.

sinteger
The start timestamp of this aggregate window in Unix Milliseconds.

einteger
The end timestamp of this aggregate window in Unix Milliseconds.

otcboolean
Whether or not this aggregate is for an OTC ticker. This field will be left off if false.

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "ev": "AM",
  "sym": "GTE",
  "v": 4110,
  "av": 9470157,
  "op": 0.4372,
  "vw": 0.4488,
  "o": 0.4488,
  "c": 0.4486,
  "h": 0.4489,
  "l": 0.4486,
  "a": 0.4352,
  "z": 685,
  "s": 1610144640000,
  "e": 1610144700000
}

Aggregates (Per Second)
WS
Real-Time:wss://socket.polygon.io/stocks
Stream real-time second aggregates for a given stock ticker symbol.
Parameters
ticker
*
*
Specify a stock ticker or use * to subscribe to all stock tickers. You can also use a comma separated list to subscribe to multiple stock tickers. You can retrieve available stock tickers from our Stock Tickers API.
{"action":"subscribe", "params":"A.*"}
Copy
Response Attributes
evenum [A]
The event type.

symstring
The ticker symbol for the given stock.

vinteger
The tick volume.

avinteger
Today's accumulated volume.

opnumber
Today's official opening price.

vwnumber
The tick's volume weighted average price.

onumber
The opening tick price for this aggregate window.

cnumber
The closing tick price for this aggregate window.

hnumber
The highest tick price for this aggregate window.

lnumber
The lowest tick price for this aggregate window.

anumber
Today's volume weighted average price.

zinteger
The average trade size for this aggregate window.

sinteger
The start timestamp of this aggregate window in Unix Milliseconds.

einteger
The end timestamp of this aggregate window in Unix Milliseconds.

otcboolean
Whether or not this aggregate is for an OTC ticker. This field will be left off if false.

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "ev": "A",
  "sym": "SPCE",
  "v": 200,
  "av": 8642007,
  "op": 25.66,
  "vw": 25.3981,
  "o": 25.39,
  "c": 25.39,
  "h": 25.39,
  "l": 25.39,
  "a": 25.3714,
  "z": 50,
  "s": 1610144868000,
  "e": 1610144869000
}

Trades
WS
Real-Time:wss://socket.polygon.io/stocks
Stream real-time trades for a given stock ticker symbol.
Parameters
ticker
*
*
Specify a stock ticker or use * to subscribe to all stock tickers. You can also use a comma separated list to subscribe to multiple stock tickers. You can retrieve available stock tickers from our Stock Tickers API.
{"action":"subscribe", "params":"T.*"}
Copy
Response Attributes
evenum [T]
The event type.

symstring
The ticker symbol for the given stock.

xinteger
The exchange ID. See Exchanges for Polygon.io's mapping of exchange IDs.

istring
The trade ID.

zinteger
The tape. (1 = NYSE, 2 = AMEX, 3 = Nasdaq).

pnumber
The price.

sinteger
The trade size.

carray [integer]
The trade conditions. See Conditions and Indicators for Polygon.io's trade conditions glossary.

tinteger
The SIP timestamp in Unix MS.

qinteger
The sequence number represents the sequence in which message events happened. These are increasing and unique per ticker symbol, but will not always be sequential (e.g., 1, 2, 6, 9, 10, 11).

trfiinteger
The ID for the Trade Reporting Facility where the trade took place.

trftinteger
The TRF (Trade Reporting Facility) Timestamp in Unix MS. This is the timestamp of when the trade reporting facility received this trade.

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "ev": "T",
  "sym": "MSFT",
  "x": 4,
  "i": "12345",
  "z": 3,
  "p": 114.125,
  "s": 100,
  "c": [
    0,
    12
  ],
  "t": 1536036818784,
  "q": 3681328
}

Quotes
WS
Real-Time:wss://socket.polygon.io/stocks
Stream real-time quotes for a given stock ticker symbol.
Parameters
ticker
*
*
Specify a stock ticker or use * to subscribe to all stock tickers. You can also use a comma separated list to subscribe to multiple stock tickers. You can retrieve available stock tickers from our Stock Tickers API.
{"action":"subscribe", "params":"Q.*"}
Copy
Response Attributes
evenum [Q]
The event type.

symstring
The ticker symbol for the given stock.

bxinteger
The bid exchange ID.

bpnumber
The bid price.

bsinteger
The bid size. This represents the number of round lot orders at the given bid price. The normal round lot size is 100 shares. A bid size of 2 means there are 200 shares for purchase at the given bid price.

axinteger
The ask exchange ID.

apnumber
The ask price.

asinteger
The ask size. This represents the number of round lot orders at the given ask price. The normal round lot size is 100 shares. An ask size of 2 means there are 200 shares available to purchase at the given ask price.

cinteger
The condition.

iarray [integer]
The indicators. For more information, see our glossary of Conditions and Indicators.

tinteger
The SIP timestamp in Unix MS.

qinteger
The sequence number represents the sequence in which quote events happened. These are increasing and unique per ticker symbol, but will not always be sequential (e.g., 1, 2, 6, 9, 10, 11). Values reset after each trading session/day.

zinteger
The tape. (1 = NYSE, 2 = AMEX, 3 = Nasdaq).

Was this helpful?
Help us improve

Yes

No
Response Object
{
  "ev": "Q",
  "sym": "MSFT",
  "bx": 4,
  "bp": 114.125,
  "bs": 100,
  "ax": 7,
  "ap": 114.128,
  "as": 160,
  "c": 0,
  "i": [
    604
  ],
  "t": 1536036818784,
  "q": 50385480,
  "z": 3
}