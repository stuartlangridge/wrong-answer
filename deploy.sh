#!/bin/bash

echo Making models...
python3 make-models.py || exit 1

echo Deploying...
ask deploy -p skill-user
