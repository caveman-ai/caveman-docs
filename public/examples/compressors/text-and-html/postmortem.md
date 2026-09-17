# Postmortem: checkout latency, 4 March 2026


Checkout p99 latency rose from 240 ms to 3.1 s for 42 minutes. No orders were lost.

## Timeline

At 09:12, the billing service reported a queue depth of 120 items and the retry budget absorbed the backlog without shedding requests.

At 09:12, the catalog service reported a queue depth of 127 items and the retry budget absorbed the backlog without shedding requests.

At 09:12, the shipping service reported a queue depth of 134 items and the retry budget absorbed the backlog without shedding requests.

At 09:12, the identity service reported a queue depth of 141 items and the retry budget absorbed the backlog without shedding requests.

At 09:13, the billing service reported a queue depth of 148 items and the retry budget absorbed the backlog without shedding requests.

At 09:13, the catalog service reported a queue depth of 155 items and the retry budget absorbed the backlog without shedding requests.

At 09:13, the shipping service reported a queue depth of 162 items and the retry budget absorbed the backlog without shedding requests.

At 09:13, the identity service reported a queue depth of 169 items and the retry budget absorbed the backlog without shedding requests.

At 09:14, the billing service reported a queue depth of 176 items and the retry budget absorbed the backlog without shedding requests.

At 09:14, the catalog service reported a queue depth of 183 items and the retry budget absorbed the backlog without shedding requests.

At 09:14, the shipping service reported a queue depth of 190 items and the retry budget absorbed the backlog without shedding requests.

At 09:14, the identity service reported a queue depth of 197 items and the retry budget absorbed the backlog without shedding requests.

At 09:15, the billing service reported a queue depth of 204 items and the retry budget absorbed the backlog without shedding requests.

At 09:15, the catalog service reported a queue depth of 211 items and the retry budget absorbed the backlog without shedding requests.

At 09:15, the shipping service reported a queue depth of 218 items and the retry budget absorbed the backlog without shedding requests.

At 09:15, the identity service reported a queue depth of 225 items and the retry budget absorbed the backlog without shedding requests.

At 09:16, the billing service reported a queue depth of 232 items and the retry budget absorbed the backlog without shedding requests.

At 09:16, the catalog service reported a queue depth of 239 items and the retry budget absorbed the backlog without shedding requests.

At 09:16, the shipping service reported a queue depth of 246 items and the retry budget absorbed the backlog without shedding requests.

At 09:16, the identity service reported a queue depth of 253 items and the retry budget absorbed the backlog without shedding requests.

At 09:17, the billing service reported a queue depth of 260 items and the retry budget absorbed the backlog without shedding requests.

At 09:17, the catalog service reported a queue depth of 267 items and the retry budget absorbed the backlog without shedding requests.

At 09:17, the shipping service reported a queue depth of 274 items and the retry budget absorbed the backlog without shedding requests.

At 09:17, the identity service reported a queue depth of 281 items and the retry budget absorbed the backlog without shedding requests.

At 09:18, the billing service reported a queue depth of 288 items and the retry budget absorbed the backlog without shedding requests.

At 09:18, the catalog service reported a queue depth of 295 items and the retry budget absorbed the backlog without shedding requests.

At 09:18, the shipping service reported a queue depth of 302 items and the retry budget absorbed the backlog without shedding requests.

At 09:18, the identity service reported a queue depth of 309 items and the retry budget absorbed the backlog without shedding requests.

At 09:19, the billing service reported a queue depth of 316 items and the retry budget absorbed the backlog without shedding requests.

At 09:19, the catalog service reported a queue depth of 323 items and the retry budget absorbed the backlog without shedding requests.

At 09:19, the shipping service reported a queue depth of 330 items and the retry budget absorbed the backlog without shedding requests.

At 09:19, the identity service reported a queue depth of 337 items and the retry budget absorbed the backlog without shedding requests.

At 09:20, the billing service reported a queue depth of 344 items and the retry budget absorbed the backlog without shedding requests.

At 09:20, the catalog service reported a queue depth of 351 items and the retry budget absorbed the backlog without shedding requests.

At 09:20, the shipping service reported a queue depth of 358 items and the retry budget absorbed the backlog without shedding requests.

At 09:20, the identity service reported a queue depth of 365 items and the retry budget absorbed the backlog without shedding requests.

At 09:21, the billing service reported a queue depth of 372 items and the retry budget absorbed the backlog without shedding requests.

At 09:21, the catalog service reported a queue depth of 379 items and the retry budget absorbed the backlog without shedding requests.

At 09:21, the shipping service reported a queue depth of 386 items and the retry budget absorbed the backlog without shedding requests.

At 09:21, the identity service reported a queue depth of 393 items and the retry budget absorbed the backlog without shedding requests.

## Impact

IMPORTANT Every affected request eventually completed. The payment gateway retried twice and the second attempt succeeded in all but three cases.

Region eu-west-1 saw 200 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-2 saw 213 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-3 saw 226 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-1 saw 239 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-2 saw 252 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-3 saw 265 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-1 saw 278 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-2 saw 291 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-3 saw 304 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-1 saw 317 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-2 saw 330 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-3 saw 343 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-1 saw 356 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-2 saw 369 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-3 saw 382 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-1 saw 395 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-2 saw 408 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-3 saw 421 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-1 saw 434 slow requests during the window, all of which returned a 200 after the retry.

Region eu-west-2 saw 447 slow requests during the window, all of which returned a 200 after the retry.

## Decision

DECISION Raise the connection pool from 40 to 120 and alert on queue depth above 400.
