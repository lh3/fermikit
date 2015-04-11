all:fermi.kit fermi.kit/htsbox fermi.kit/ropebwt2 fermi.kit/bfc fermi.kit/bwa fermi.kit/seqtk fermi.kit/trimadap-mt \
	fermi.kit/k8 fermi.kit/fermi2 fermi.kit/fermi2.pl fermi.kit/fermi2.js

fermi.kit:
	mkdir $@

##############
### htsbox ###
##############

htsbox:
	git clone https://github.com/lh3/htsbox.git

htsbox/htsbox:htsbox
	(cd $<; make)

fermi.kit/htsbox:htsbox/htsbox fermi.kit
	cp $< $@; strip $@

################
### ropebwt2 ###
################

ropebwt2:
	git clone https://github.com/lh3/ropebwt2.git

ropebwt2/ropebwt2:ropebwt2
	(cd $<; make)

fermi.kit/ropebwt2:ropebwt2/ropebwt2 fermi.kit
	cp $< $@; strip $@

###########
### bfc ###
###########

bfc:
	git clone https://github.com/lh3/bfc.git

bfc/bfc:bfc
	(cd $<; make)

fermi.kit/bfc:bfc/bfc fermi.kit
	cp $< $@; strip $@

###########
### bwa ###
###########

bwa:
	git clone https://github.com/lh3/bwa.git

bwa/bwa:bwa
	(cd $<; make)

fermi.kit/bwa:bwa/bwa fermi.kit
	cp $< $@; strip $@

#############
### seqtk ###
#############

seqtk:
	git clone https://github.com/lh3/seqtk.git

seqtk/seqtk:seqtk
	(cd $<; make)

fermi.kit/seqtk:seqtk/seqtk fermi.kit
	cp $< $@; strip $@

################
### trimadap ###
################

trimadap:
	git clone https://github.com/lh3/trimadap.git

trimadap/trimadap-mt:trimadap
	(cd $<; make)

fermi.kit/trimadap-mt:trimadap/trimadap-mt fermi.kit
	cp $< $@; strip $@

##############
### fermi2 ###
##############

fermi2:
	git clone https://github.com/lh3/fermi2.git

fermi2/fermi2:fermi2
	(cd $<; make)

fermi.kit/fermi2:fermi2/fermi2 fermi.kit
	cp $< $@; strip $@

fermi.kit/fermi2.js fermi.kit/fermi2.pl:fermi2 fermi.kit
	cp fermi2/fermi2.js fermi2/fermi2.pl fermi.kit

##########
### k8 ###
##########

k8-0.2.1.tar.bz2:
	wget -O $@ http://sourceforge.net/projects/biobin/files/devtools/k8-0.2.1.tar.bz2/download

fermi.kit/k8:k8-0.2.1.tar.bz2 fermi.kit
	(cd fermi.kit; tar -jxf ../$< k8-`uname -s|tr [A-Z] [a-z]`; mv k8-`uname -s|tr [A-Z] [a-z]` k8)

#############
### clean ###
#############

clean:
	rm -fr fermi.kit; \
	[ -d htsbox ] && (cd htsbox; make clean; rm -fr .git); \
	[ -d ropebwt2 ] && (cd ropebwt2; make clean; rm -fr .git); \
	[ -d bfc ] && (cd bfc; make clean; rm -fr .git); \
	[ -d bwa ] && (cd bwa; make clean; rm -fr .git); \
	[ -d fermi2 ] && (cd fermi2; make clean; rm -fr .git); \
	[ -d seqtk ] && (cd seqtk; make clean; rm -fr .git); \
	[ -d trimadap ] && (cd trimadap; make clean; rm -fr .git);

distclean:clean
	rm -fr htsbox ropebwt2 bfc bwa fermi2 seqtk trimadap k8-0.2.1.tar.bz2
