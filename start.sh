#!/bin/bash
cd /home/runner/workspace/Backend && python app.py &
sleep 2
cd /home/runner/workspace/Frontend && PORT=5000 npm start
