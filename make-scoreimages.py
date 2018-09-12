#!/usr/bin/env python3
from xml.dom import minidom
import os
fp = open("score.svg", encoding="utf-8")
data = fp.read()
fp.close()

TIME_GREY = "#b3b3b3"
SCORE_GREY = "#999999"
TIME_RED = "#ff2a2a"
SCORE_GREEN = "#55d400"

TIMES = ["cn", "cne", "cse", "cs", "csw", "cnw"]
SCORES = ["s%s" % x for x in range(1, 10)]

count = 0
for t in range(len(TIMES)+1):
    thesetimes = TIMES[:t]
    for s in range(len(SCORES)+1):
        thesescores = SCORES[:s]
        count += 1
        name="c{}s{}".format(t, s)
        dom = minidom.parseString(data)
        rects = dict([(x.getAttribute("id"), x) for x in dom.getElementsByTagName("rect")])
        paths = dict([(x.getAttribute("id"), x) for x in dom.getElementsByTagName("path")])
        for time in thesetimes:
            el = paths[time]
            s = el.getAttribute("style")
            s = s.replace("fill:" + TIME_GREY, "fill:" + TIME_RED)
            el.setAttribute("style", s)
        for score in thesescores:
            el = rects[score]
            s = el.getAttribute("style")
            s = s.replace("fill:" + SCORE_GREY, "fill:" + SCORE_GREEN)
            el.setAttribute("style", s)
        fp = open("/tmp/score-temp.svg", mode="w", encoding="utf-8")
        fp.write(dom.toxml())
        fp.close()
        os.system("convert -background none /tmp/score-temp.svg -resize 400x400 scoreimages/{}.png".format(name))
        os.system("convert -size 1920x1080 xc:none scoreimages/{}.png -geometry +764+239 -composite video/scoreimages/{}.png".format(name, name))
        print("{:>4}. Set {} + {} on as {}".format(count, ",".join(thesetimes), ",".join(thesescores), name))


