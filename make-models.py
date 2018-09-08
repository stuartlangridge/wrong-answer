#!/usr/bin/env python3

import json, os, re, copy

NUMWORDS = ["zero", "one", "two", "three", "four", "five", "six", 
    "seven", "eight", "nine", "ten", "eleven", "twelve", 
    "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", 
    "eighteen", "nineteen"]
TENWORDS = ["", "ten", "twenty", "thirty", "forty", "fifty", 
"sixty", "seventy", "eighty", "ninety"]
def numword(n):
    if n < 20: return NUMWORDS[n]
    tens = int(n/10)
    return TENWORDS[tens] + NUMWORDS[n % 10]

print("* Loading questions...")
fp = open(os.path.join(os.path.dirname(__file__), "lambda", "custom", "questions.js"), encoding="utf-8")
data = fp.read()
fp.close()
lines = data.split("\n")
lines = [x.strip() for x in lines if x.strip()]
lines = lines[1:-1]

questions = []
used_answers = set()
for qid in range(len(lines)):
    line = lines[qid]
    m = re.match(r'^\["(.*?)", "(.*?)", "(.*?)"\],?$', line)
    if not m:
        raise Exception("Couldn't parse line '{}', aborting".format(line))
    assert(len(m.groups()) == 3)
    question, right, wrong = m.groups()
    if right in used_answers:
        raise Exception("Answer {} is used for two questions".format(right))
    if wrong in used_answers:
        raise Exception("Answer {} is used for two questions".format(wrong))
    questions.append({
        "question": question,
        "right": right,
        "wrong": wrong,
        "qid": qid
    })

print("* Creating models...")
MODELNAMES = ["en-GB"]
fp = open(os.path.join(os.path.dirname(__file__), "models", "base.json"), encoding="utf-8")
base = json.load(fp)
fp.close()
for modelname in MODELNAMES:
    print("  - {}".format(modelname))
    model = copy.deepcopy(base)
    for q in questions:
        rintent = {
            "name": "Q{}RightIntent".format(numword(q["qid"])),
            "samples": [q["right"].lower()]
        }
        wintent = {
            "name": "Q{}WrongIntent".format(numword(q["qid"])),
            "samples": [q["wrong"].lower()]
        }
        model["interactionModel"]["languageModel"]["intents"].append(rintent)
        model["interactionModel"]["languageModel"]["intents"].append(wintent)
    fp = open(os.path.join(os.path.dirname(__file__), "models", "{}.json".format(modelname)), encoding="utf-8", mode="w")
    json.dump(model, fp, indent=2)
    fp.close()


