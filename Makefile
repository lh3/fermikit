SUBDIRS=bfc bwa fermi2 htsbox ropebwt2 seqtk trimadap

all:fermi.kit/htsbox fermi.kit/ropebwt2 fermi.kit/bfc fermi.kit/bwa fermi.kit/seqtk fermi.kit/trimadap-mt \
	fermi.kit/fermi2 fermi.kit/fermi2.pl fermi.kit/fermi2.js fermi.kit/k8 fermi.kit/hapdip.js \
	fermi.kit/run-calling

fermi.kit:
	mkdir -p fermi.kit

all-recur clean-recur:
	@target=`echo $@ | sed s/-recur//`; \
	wdir=`pwd`; \
	list='$(SUBDIRS)'; for subdir in $$list; do \
		cd $$subdir; \
		$(MAKE) $$target || exit 1; \
		cd $$wdir; \
	done;

prepare:all-recur fermi.kit

fermi.kit/bfc:prepare
	cp bfc/bfc $@; strip $@

fermi.kit/bwa:prepare
	cp bwa/bwa $@; strip $@

fermi.kit/fermi2:prepare
	cp fermi2/fermi2 $@; strip $@

fermi.kit/htsbox:prepare
	cp htsbox/htsbox $@; strip $@

fermi.kit/ropebwt2:prepare
	cp ropebwt2/ropebwt2 $@; strip $@

fermi.kit/seqtk:prepare
	cp seqtk/seqtk $@; strip $@

fermi.kit/trimadap-mt:prepare
	cp trimadap/trimadap-mt $@; strip $@

fermi.kit/fermi2.pl:fermi.kit
	cp fermi2/fermi2.pl $@

fermi.kit/fermi2.js:fermi.kit
	cp fermi2/fermi2.js $@

fermi.kit/hapdip.js:fermi.kit
	cp hapdip/hapdip.js $@

fermi.kit/run-calling:run-calling
	cp $< $@

fermi.kit/k8:k8-0.2.2.tar.bz2 fermi.kit
	(cd fermi.kit; tar -jxf ../$< k8-`uname -s|tr [A-Z] [a-z]` && mv k8-`uname -s|tr [A-Z] [a-z]` k8)

test: all
	test/test.sh

clean:clean-recur
	rm -fr fermi.kit
	rm -f test/ARTIFACT_*

.PHONY: all all-recur clean-recur prepare test clean
