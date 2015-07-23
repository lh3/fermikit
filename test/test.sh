#!/bin/bash

set -ex -o pipefail

HERE=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd "$HERE"
rm -f ARTIFACT_*

function unitig_lengths {
	gzip -dc "$1" | awk '{if(NR%4==2) print length($1)}' | sort -nr
}
function N50 {
	local L=$(unitig_lengths "$1" | awk 'BEGIN {tot=0;} {tot+=$0} END {print tot;}')
	unitig_lengths "$1" | awk "$(printf 'BEGIN {tot=0;last=0;} tot < %d/2 { tot+=$0; last=$0;} END {print last;}' $L)"
}

# The 2x100 reads in HS1011_11_1910000_1940000.fastq.gz are derived from an
# individual with a complex rearrangement relative to the indicated region of
# the GRCh37 reference. It's described in Figure 7 of English et al. 2015
# (doi:10.1186/s12864-015-1479-3).
../fermi.kit/fermi2.pl unitig -s30000 -t4 -l100 -p ARTIFACT_HS1011_rearrangement HS1011_11_1910000_1940000.fastq.gz > ARTIFACT_HS1011_rearrangement.mak
make -f ARTIFACT_HS1011_rearrangement.mak
if [ $(N50 ARTIFACT_HS1011_rearrangement.mag.gz) -lt 2300 ]; then
	echo "HS1011_rearrangement N50 too low!"
	exit 1
fi

cp 11_1910000_1940000.fa ARTIFACT_11_1910000_1940000.fa
../fermi.kit/bwa index ARTIFACT_11_1910000_1940000.fa
../fermi.kit/htsbox faidx ARTIFACT_11_1910000_1940000.fa
../fermi.kit/run-calling ARTIFACT_11_1910000_1940000.fa ARTIFACT_HS1011_rearrangement.mag.gz | bash -ex -o pipefail

# TODO: look for evidence of breakpoints in ARTIFACT_HS1011_rearrangement.srt.bam
# e.g.:
# 21010:17446     2064    11_1910000_1940000      4453    60      823M1569H
# 21010:17446     16      11_1910000_1940000      26957   60      826S779M1D787M
