/**************
 * From k8.js *
 **************/

var getopt = function(args, ostr) {
	var oli; // option letter list index
	if (typeof(getopt.place) == 'undefined')
		getopt.ind = 0, getopt.arg = null, getopt.place = -1;
	if (getopt.place == -1) { // update scanning pointer
		if (getopt.ind >= args.length || args[getopt.ind].charAt(getopt.place = 0) != '-') {
			getopt.place = -1;
			return null;
		}
		if (getopt.place + 1 < args[getopt.ind].length && args[getopt.ind].charAt(++getopt.place) == '-') { // found "--"
			++getopt.ind;
			getopt.place = -1;
			return null;
		}
	}
	var optopt = args[getopt.ind].charAt(getopt.place++); // character checked for validity
	if (optopt == ':' || (oli = ostr.indexOf(optopt)) < 0) {
		if (optopt == '-') return null; //  if the user didn't specify '-' as an option, assume it means null.
		if (getopt.place < 0) ++getopt.ind;
		return '?';
	}
	if (oli+1 >= ostr.length || ostr.charAt(++oli) != ':') { // don't need argument
		getopt.arg = null;
		if (getopt.place < 0 || getopt.place >= args[getopt.ind].length) ++getopt.ind, getopt.place = -1;
	} else { // need an argument
		if (getopt.place >= 0 && getopt.place < args[getopt.ind].length)
			getopt.arg = args[getopt.ind].substr(getopt.place);
		else if (args.length <= ++getopt.ind) { // no arg
			getopt.place = -1;
			if (ostr.length > 0 && ostr.charAt(0) == ':') return ':';
			return '?';
		} else getopt.arg = args[getopt.ind]; // white space
		getopt.place = -1;
		++getopt.ind;
	}
	return optopt;
}

function intv_ovlp(intv, bits)
{
	if (typeof bits == "undefined") bits = 13;
	intv.sort(function(a,b) {return a[0]-b[0];});
	// merge overlapping regions
	var j = 0;
	for (var i = 1; i < intv.length; ++i) {
		if (intv[j][1] > intv[i][0])
			intv[j][1] = intv[j][1] > intv[i][1]? intv[j][1] : intv[i][1];
		else intv[++j] = intv[i].slice(0);
	}
	intv.length = j + 1;
	//
	var sum = 0;
	for (var i = 0; i < intv.length; ++i)
		sum += intv[i][1] - intv[i][0];
	// create the index
	var idx = [], max = 0;
	for (var i = 0; i < intv.length; ++i) {
		var b = intv[i][0]>>bits;
		var e = (intv[i][1]-1)>>bits;
		if (b != e) {
			for (var j = b; j <= e; ++j)
				if (idx[j] == null) idx[j] = i;
		} else if (idx[b] == null) idx[b] = i;
		max = max > e? max : e;
	}
	return function(_b, _e) { // closure
		var x = _b >> bits;
		if (x > max) return false;
		var off = idx[x];
		if (off == null) {
			var i;
			for (i = ((_e - 1) >> bits) - 1; i >= 0; --i)
				if (idx[i] != null) break;
			off = i < 0? 0 : idx[i];
		}
		for (var i = off; i < intv.length && intv[i][0] < _e; ++i)
			if (intv[i][1] > _b) return true;
		return false;
	}
}

function read_bed(fn, shift)
{
	var f = fn == '-'? new File() : new File(fn);
	var b = new Bytes();
	var reg = {}, idx = {};
	while (f.readline(b) >= 0) {
		var t = b.toString().split("\t");
		if (reg[t[0]] == null) reg[t[0]] = [];
		reg[t[0]].push([parseInt(t[1]), parseInt(t[2])]);
	}
	for (var chr in reg)
		idx[chr] = intv_ovlp(reg[chr], shift);
	b.destroy();
	f.close();
	return idx;
}

/*****************
 * Main function *
 *****************/

var c, beds = [], min_top_sr = 10, no_filter = false, no_gt = false;
while ((c = getopt(arguments, "GFb:n:")) != null) {
	if (c == 'n') min_top_sr = parseInt(getopt.arg);
	else if (c == 'F') no_filter = true;
	else if (c == 'G') no_gt = true;
	else if (c == 'b') {
		var m, label = null, fn = null;
		if ((m = /([^\s=]+)=(\S+)/.exec(getopt.arg)) != null) {
			label = m[1];
			fn = m[2];
		} else label = fn = getopt.arg;
		warn('Reading BED file ' + fn + '...');
		beds.push([label, read_bed(fn, 11)]);
	}
}

if (arguments.length == getopt.ind) {
	print("Usage: k8 multiflt.js [options] <htsbox-pileup.vcf>");
	print("Options:");
	print("  -b STR=FILE   flag STR in INFO if overlapping regions in BED FILE [null]");
	print("  -n INT        threshold on the SR filter [10]");
	print("  -G            discard genotype fields");
	print("  -F            don't set FILTER");
	exit(1);
}

warn('Processing VCF...');

var new_lines = "";
new_lines += '##FILTER=<ID=TOPSR,Description="TOPSR < ' + min_top_sr + '">\n';
new_lines += '##FILTER=<ID=CA0,Description="ALT allele count equals zero">\n';
for (var i = 0; i < beds.length; ++i)
	new_lines += '##INFO=<ID=' + beds[i][0] + ',Number=0,Type=Flag>\n';
new_lines += '##INFO=<ID=TOPSR,Number=R,Type=Integer,Description="best SR across samples">\n';
new_lines += '##INFO=<ID=SR,Number=R,Type=Integer,Description="number of supporting reads">\n';
new_lines += '##INFO=<ID=CA,Number=R,Type=Integer,Description="count of reference and alternate alleles">\n';
new_lines += '##INFO=<ID=CG,Number=G,Type=Integer,Description="count of genotypes">';

var file = new File(arguments[getopt.ind]);
var buf = new Bytes();

while (file.readline(buf) >= 0) {
	var line = buf.toString();
	if (line.charAt(0) == '#') {
		if (line.charAt(1) != '#') {
			print(new_lines);
			if (no_gt) line = line.split("\t", 8).join("\t");
		}
		print(line);
		continue;
	}
	var t = line.split("\t");
	var gt = null, sr = null;
	var s = t[8].split(":");
	for (var i = 0; i < s.length; ++i)
		if (s[i] == 'GT') gt = i;
		else if (s[i] == 'SR') sr = i;
	var ACA = [], SR = [], topSR = [], CG = [];
	var n_alleles = t[4].split(",").length + 1, n_gt = Math.floor(n_alleles * (n_alleles + 1) / 2 + .499);
	for (var i = 0; i < n_alleles; ++i) ACA[i] = SR[i] = topSR[i] = 0;
	for (var i = 0; i < n_gt; ++i) CG[i] = 0;
	for (var j = 9; j < t.length; ++j) {
		s = t[j].split(":");
		if (gt != null) {
			var m;
			if ((m = /(\.|\d+)[\/\|](\.|\d+)/.exec(s[gt])) != null) {
				var h1 = m[1] != '.'? parseInt(m[1]) : -1;
				var h2 = m[2] != '.'? parseInt(m[2]) : -1;
				if (h1 >= 0) ++ACA[h1];
				if (h2 >= 0) ++ACA[h2];
				if (h1 >= 0 && h2 >= 0) {
					var tmp;
					if (h1 > h2) tmp = h1, h1 = h2, h2 = tmp;
					tmp = Math.floor(h1 * (h1 + 1) / 2 + h2 + .499);
					++CG[tmp];
				}
			}
		}
		if (sr != null) {
			var v = s[sr].split(",");
			for (var k = 0; k < v.length; ++k) {
				var u = parseInt(v[k]);
				SR[k] += u;
				topSR[k] = topSR[k] > u? topSR[k] : u;
			}
		}
	}
	// set INFO
	if (t[7] == '.') t[7] = '';
	else t[7] += ';';
	t[7] += 'CA=' + ACA.join(",") + ';CG=' + CG.join(",");
	if (sr != null) t[7] += ';SR=' + SR.join(",") + ';TOPSR=' + topSR.join(",");
	// test BED
	for (var i = 0; i < beds.length; ++i) {
		var start = parseInt(t[1]) - 1;
		if (beds[i][1][t[0]] && beds[i][1][t[0]](start, start + t[3].length))
			t[7] += ';' + beds[i][0];
	}
	// set FILTER
	if (!no_filter) {
		var alt_cnt = 0, flt = '', max_topSR = 0;
		for (var i = 1; i < ACA.length; ++i)
			alt_cnt += ACA[i], max_topSR = max_topSR > topSR[i]? max_topSR : topSR[i];
		if (alt_cnt == 0) flt = 'CA0';
		if (sr != null && max_topSR < min_top_sr)
			flt = flt == ''? 'TOPSR' : flt + ';TOPSR';
		t[6] = flt == ''? 'PASS' : flt;
	}
	// print out
	if (no_gt) t.length = 8;
	print(t.join("\t"));
}

buf.destroy();
file.close();
