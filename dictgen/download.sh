#!/bin/bash

rm -rf scowl
mkdir scowl
wget -qO- https://sourceforge.net/projects/wordlist/files/SCOWL/2020.12.07/scowl-2020.12.07.tar.gz/download | tar xvz - -C scowl --strip-components 1
