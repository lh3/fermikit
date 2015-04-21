.SUFFIXES: .gp .tex .eps .pdf .eps.gz

.eps.pdf:
		epstopdf --outfile $@ $<

.eps.gz.pdf:
		gzip -dc $< | epstopdf --filter > $@

.pdf.eps:
		pdftops -eps $< $@

all:fermikit.pdf

fermikit.pdf:fermikit.tex fermikit.bib
		pdflatex fermikit; bibtex fermikit; pdflatex fermikit; pdflatex fermikit;

clean:
		rm -fr *.toc *.aux *.bbl *.blg *.idx *.log *.out *~
