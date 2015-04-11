* 0.11
  - updated fermi2.pl to r188 for robustness (no method changes)
  - updated htsbox to r289 for quality binning and razip fix
* 0.10
  - updated htsbox to r282 which fixed a bug in samview's PAF output.
  - updated bfc to r181 which fixes a potential out-of-order bug. This bug
    should almost never happen for normal use of bfc.
  - updated bwa to r1044 for the same bugfix as in bfc.
  - updated trimadap-mt to r8 for the same bug.
  - updated seqtk to r82. It comes with two new commands `rename` and `gc`,
    though they are not actually useful to the fermi.kit pipeline.
* 0.9
  - updated fermi2.pl. It uses a new formula to automatically set -k.
  - updated htsbox to r281. No effective changes.
* 0.8
  - updated bfc to r177. r177 fixed a bug which causes segfault if the read
    length is close to 128, 256, 512bp, etc. The results should be the same
    (except the random effect).
  - fermi2.pl optionally skip error correction.
* 0.7
  - used to assemble SGDP public samples
  - used to assemble the CHM1-NA12878 pair v4
