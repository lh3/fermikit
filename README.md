[![Build Status](https://travis-ci.org/lh3/fermikit.svg?branch=master)](https://travis-ci.org/lh3/fermikit)
## Introduction

FermiKit is a *de novo* assembly based variant calling pipeline for deep
Illumina resequencing data. It assembles reads into unitigs, maps them to the
reference genome and then calls variants from the alignment to an accuracy
comparable to conventional mapping based pipelines (see evaluation in the `tex`
directory). The assembly does not only encode SNPs and short INDELs, but also
retains long deletions, novel sequence insertions, translocations and copy
numbers. It is a heavily reduced representation of raw data. Storing,
distributing and analyzing assemblies is much faster and cheaper at an
acceptable loss of information.

FermiKit is not a prototype. It is a practical pipeline targeting large-scale
data and has been used to process hundreds of human samples. On a modern server
with 16 CPU cores, FermiKit can assemble 30-fold human reads in one day with
about 85GB RAM at the peak. The subsequent mapping and variant calling only
take half an hour.

## Installation and Usage

The only library dependency of FermiKit is [zlib][zlib]. To compile on Linux or
Mac:
```sh
git clone --recursive https://github.com/lh3/fermikit.git
cd fermikit
make
```
This creates a `fermikit/fermi.kit` directory containing all the executables.
You can copy the `fermi.kit` directory anywhere and invoke the pipeline by
specifying absolute or relative path:
```sh
# assembly reads into unitigs (-s specifies the genome size and -l the read length)
fermi.kit/fermi2.pl unitig -s3g -t16 -l150 -p prefix reads.fq.gz > prefix.mak
make -f prefix.mak
# call small variants and structural variations
fermi.kit/run-calling -t16 bwa-indexed-ref.fa prefix.mag.gz | sh
```
This generates `prefix.mag.gz` for the final assembly and `prefix.flt.vcf.gz`
for filtered SNPs and short INDELs and `prefix.sv.vcf.gz` for long deletions,
novel sequence insertions and complex structural variations. If you have
multiple FASTQ files and want to trim adapters before assembly:
```sh
fermi.kit/fermi2.pl unitig -s3g -t16 -l150 -p prefix \
    "fermi.kit/seqtk mergepe r1.fq r2.fq | fermi.kit/trimadap-mt -p4" > prefix.mak
```
It is also possible to call SNPs and short INDELs from multiple BAMs at the
same time and produce a multi-sample VCF:
```sh
fermi.kit/htsbox pileup -cuf ref.fa pre1.srt.bam pre2.srt.bam > out.raw.vcf
fermi.kit/k8 fermi.kit/hapdip.js vcfsum -f out.raw.vcf > out.flt.vcf
```

## Limitations

FermiKit does not use paired-end information during assembly, which potentially
leads to loss of power. In evaluations, the loss is minor for germline samples
and even without pair information, FermiKit is more sensitive to short INDELs
and long deletions. Furthermore, with longer upcoming Illumina reads, it is
actually preferred to merge overlapping ends in a pair before assembly and
treat the merged reads as regular single-end reads (see AllPaths-LG and
DISCOVAR).

Another technical limitation of FermiKit is that the error correction phase
may take excessive RAM when the error rate is unusually high. In practice,
this concern is also minor. I have assembled ~270 human samples and none of
them require more than ~90GB RAM.

Running FermiKit twice on the same dataset under the same setting is likely to
result in two slightly different assemblies. Please see bfc/count.c for the
cause in BFC. Unitig construction also has a random factor under the
multi-threading mode. Nonetheless, FermiKit should call the same variants from
the same assembly.

[zlib]: http://zlib.net
