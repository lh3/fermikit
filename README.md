## Introduction

FermiKit is a *de novo* assembly based variant calling pipeline for deep
Illumina resequencing data. It assembles reads into unitigs, maps them to the
reference genome and then calls variants from the alignment to an accuracy
comparable to conventional mapping based pipelines. The unitigs produced from
the assembly not only encode SNPs and short INDELs, but also retain long
deletions, novel sequence insertions and translocations. In theory, we may use
the unitigs for most downstream analyses without much loss of information. In
this sense, unitigs are lossy compression of raw reads.

FermiKit is not a prototype. It is a practical pipeline targeting large-scale
data and has been used to process hundreds of human samples. On a modern server
with 16 CPU cores, FermiKit can assemble 30-fold human reads in one day with
about 80GB RAM at the peak. The subsequent mapping and variant calling only
take 20 minutes. The performance is compared favorably to the mainstream
variant calling pipelines we are using today.

## Installation and Usage

To compile (on Linux and Mac only):
```sh
git clone --recursive https://github.com/lh3/fermikit.git
cd fermikit
make
```
This creates a `fermikit/fermi.kit` directory containing all the executables.
You can copy the `fermi.kit` directory anywhere and invoke the pipeline with
absolute or relative path:
```sh
# assembly reads into unitigs (-s specifies the genome size and -l the read length)
fermi.kit/fermi2.pl unitig -s3g -t16 -l150 -p prefix reads.fq.gz > prefix.mak
make -f prefix.mak
# mapping (-x intractg triggers setting for intra-species unitig mapping)
fermi.kit/bwa mem -t16 -x intractg ref.fa prefix.mag.gz | gzip -1 > prefix.sam.gz
samtools view -uS prefix.sam.gz | samtools sort -m20G - prefix
# calling small variants
fermi.kit/htsbox pileup -cuf ref.fa prefix.bam > prefix.vcf
# calling structural variations
fermi.kit/htsbox abreak -u prefix.sam.gz > prefix.txt
```
If you have multiple FASTQ files and want to trim adapters before assembly:
```sh
fermi.kit/fermi2.pl unitig -s3g -t16 -l150 -p prefix \
    "fermi.kit/seqtk mergepe read1.fq read2.fq | fermi.kit/trimadap-mt -p4" > prefix.mak
```
For small variant calling, we may also call multiple BAMs at the same time to
produce a multi-sample VCF.

## Limitations

FermiKit assumes all reads are single-ended. This leads to loss of power
especially in semi-repetitive regions. In practice, this issue is minor for
germline samples. FermiKit actually produces more sensitive INDEL calls
due to the higher power of its assembly-based approach. Detailed evaluations
are coming.

