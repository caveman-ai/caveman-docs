---
name: release-checks
description: Pre-release verification steps for the ingest service.
---

# Release checks

## Step 1

Run `make verify TARGET=step-1` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 2 until the drain check passes twice in a row.

## Step 2

Run `make verify TARGET=step-2` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 3 until the drain check passes twice in a row.

## Step 3

Run `make verify TARGET=step-3` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 4 until the drain check passes twice in a row.

## Step 4

Run `make verify TARGET=step-4` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 5 until the drain check passes twice in a row.

## Step 5

Run `make verify TARGET=step-5` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 6 until the drain check passes twice in a row.

## Step 6

Run `make verify TARGET=step-6` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 7 until the drain check passes twice in a row.

## Step 7

Run `make verify TARGET=step-7` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 8 until the drain check passes twice in a row.

## Step 8

Run `make verify TARGET=step-8` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 9 until the drain check passes twice in a row.

## Step 9

Run `make verify TARGET=step-9` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 10 until the drain check passes twice in a row.

## Step 10

Run `make verify TARGET=step-10` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 11 until the drain check passes twice in a row.

## Step 11

Run `make verify TARGET=step-11` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 12 until the drain check passes twice in a row.

## Step 12

Run `make verify TARGET=step-12` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 13 until the drain check passes twice in a row.

## Step 13

Run `make verify TARGET=step-13` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 14 until the drain check passes twice in a row.

## Step 14

Run `make verify TARGET=step-14` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 15 until the drain check passes twice in a row.

## Step 15

Run `make verify TARGET=step-15` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 16 until the drain check passes twice in a row.

## Step 16

Run `make verify TARGET=step-16` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 17 until the drain check passes twice in a row.

## Step 17

Run `make verify TARGET=step-17` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 18 until the drain check passes twice in a row.

## Step 18

Run `make verify TARGET=step-18` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 19 until the drain check passes twice in a row.

## Step 19

Run `make verify TARGET=step-19` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 20 until the drain check passes twice in a row.

## Step 20

Run `make verify TARGET=step-20` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 21 until the drain check passes twice in a row.

## Step 21

Run `make verify TARGET=step-21` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 22 until the drain check passes twice in a row.

## Step 22

Run `make verify TARGET=step-22` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 23 until the drain check passes twice in a row.

## Step 23

Run `make verify TARGET=step-23` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 24 until the drain check passes twice in a row.

## Step 24

Run `make verify TARGET=step-24` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 25 until the drain check passes twice in a row.

## Step 25

Run `make verify TARGET=step-25` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 26 until the drain check passes twice in a row.

## Step 26

Run `make verify TARGET=step-26` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 27 until the drain check passes twice in a row.

## Step 27

Run `make verify TARGET=step-27` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 28 until the drain check passes twice in a row.

## Step 28

Run `make verify TARGET=step-28` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 29 until the drain check passes twice in a row.

## Step 29

Run `make verify TARGET=step-29` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 30 until the drain check passes twice in a row.

## Step 30

Run `make verify TARGET=step-30` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 31 until the drain check passes twice in a row.

## Step 31

Run `make verify TARGET=step-31` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 32 until the drain check passes twice in a row.

## Step 32

Run `make verify TARGET=step-32` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 33 until the drain check passes twice in a row.

## Step 33

Run `make verify TARGET=step-33` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 34 until the drain check passes twice in a row.

## Step 34

Run `make verify TARGET=step-34` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 35 until the drain check passes twice in a row.

## Step 35

Run `make verify TARGET=step-35` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 36 until the drain check passes twice in a row.

## Step 36

Run `make verify TARGET=step-36` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 37 until the drain check passes twice in a row.

## Step 37

Run `make verify TARGET=step-37` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 38 until the drain check passes twice in a row.

## Step 38

Run `make verify TARGET=step-38` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 39 until the drain check passes twice in a row.

## Step 39

Run `make verify TARGET=step-39` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 40 until the drain check passes twice in a row.

## Step 40

Run `make verify TARGET=step-40` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 41 until the drain check passes twice in a row.

## Step 41

Run `make verify TARGET=step-41` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 42 until the drain check passes twice in a row.

## Step 42

Run `make verify TARGET=step-42` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 43 until the drain check passes twice in a row.

## Step 43

Run `make verify TARGET=step-43` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 44 until the drain check passes twice in a row.

## Step 44

Run `make verify TARGET=step-44` and confirm the ingest queue drains within 30 seconds. If the queue stalls, capture `kubectl logs -l app=ingest --since=5m` and attach it to the release ticket. Do not proceed to step 45 until the drain check passes twice in a row.
