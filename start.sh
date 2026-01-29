#!/bin/bash
cd /home/runner/workspace/Backend && python app.py &
sleep 2
cd /home/runner/workspace/Frontend && npm start
