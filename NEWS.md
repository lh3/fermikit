* 0.14 (not released yet)
  - updated fermi2 to r193 for a fix of open end trimming
  - updated bwa to r1142 (post 0.7.15)
  - updated trimadap for one additional 3'-end PE adapter
  - updated hapdip to r56 for better filtering in the fermikit mode
  - updated htsbox to r327 (forgot if it has any effect on fermikit)
  - updated k8 to 0.2.2 as is required by more recent hapdip
  - the assembly components should almost the same as v0.13, except the fermi2 bugfix for good
* 0.13
  - updated trimadap to r9 for trimming (not only masking)
  - updated hapdip to r36 for minor bug fixes
  - updated htsbox to r130 for a few minor changes and BAM sorting
  - dropped samtools dependency for BAM sorting (now by htsbox)
  - added test script (by Mike Lin)
  - The assembly components are identical to v0.12.
  - The calling components are also identical.
* 0.12
  - updated htsbox to r302 for SV calling
  - updated hapdip to r19 for multi-sample filtering.
  - This is the first public release of fermi.kit.
* 0.11
  - updated fermi2.pl to r188 for robustness (no method changes)
  - updated htsbox to r289 for quality binning and razip fix
  - The assembly is the same as v0.9
  - This version is not packaged.
* 0.10
  - updated htsbox to r282 which fixed a bug in samview's PAF output.
  - updated bfc to r181 which fixes a potential out-of-order bug. This bug
    should almost never happen for normal use of bfc.
  - updated bwa to r1044 for the same bugfix as in bfc.
  - updated trimadap-mt to r8 for the same bug.
  - updated seqtk to r82. It comes with two new commands `rename` and `gc`,
    though they are not actually useful to the fermi.kit pipeline.
  - The assembly is the same as v0.9.
* 0.9
  - updated fermi2.pl. It uses a new formula to automatically set -k.
  - updated htsbox to r281. No effective changes.
  - For 100bp reads, the assembly is the same as v0.8.
  - This version is used to produce the results in the manuscript.
* 0.8
  - updated bfc to r177. r177 fixed a bug which causes segfault if the read
    length is close to 128, 256, 512bp, etc. The results should be the same
    (except the random effect).
  - fermi2.pl optionally skip error correction.
  - This version is used to assemble 261 SGDP samples.
* 0.7
  - used to assemble SGDP public samples
  - used to assemble the CHM1-NA12878 pair v4
