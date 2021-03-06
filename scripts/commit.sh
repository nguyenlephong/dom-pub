#!/bin/env bash
set -o xtrace

# Color array
#Black        0;30     Dark Gray     1;30
#Red          0;31     Light Red     1;31
#Green        0;32     Light Green   1;32
#Brown/Orange 0;33     Yellow        1;33
#Blue         0;34     Light Blue    1;34
#Purple       0;35     Light Purple  1;35
#Cyan         0;36     Light Cyan    1;36
#Light Gray   0;37     White         1;37
GREEN='\033[0;32m'
NC='\033[0m'


printf "${GREEN}Your commit message is: $1\n${NC}"

#FROM_DEVELOP_BRANCH=develop
#git checkout $FROM_DEVELOP_BRANCH

git add .
git commit -m "$1"
git pull
git push
#origin $FROM_DEVELOP_BRANCH

printf "${GREEN}Push code successfully. Thanks for using the command <3.\n${NC}"