function b8_parse_vcf_multi(t) // t = vcf_line.split("\t")
{
	if (t.length < 6) return null;
	var a = [];
	t[1] = parseInt(t[1]) - 1; t[3] = t[3].toUpperCase(); t[4] = t[4].toUpperCase(); t[5] = parseFloat(t[5]);
	var s = t[4].split(","); // list of ALT alleles
	// get allele counts
	var n_alleles = t[4].split(",").length + 1, n_gt = Math.floor(n_alleles * (n_alleles + 1) / 2 + .499);
	var ACA = [], tot = 0;
	for (var i = 0; i < n_alleles; ++i) ACA[i] = 0;
	if (t.length >= 10 && t[8].substr(0, 2) == 'GT') {
		for (var i = 9; i < t.length; ++i) {
			var m;
			if ((m = /(\.|\d+)[\/\|](\.|\d+)/.exec(t[i])) != null) {
				if (m[1] != '.') ++ACA[parseInt(m[1])], ++tot;
				if (m[2] != '.') ++ACA[parseInt(m[2])], ++tot;
			}
		}
	}
	// get CIGAR for freebayes
	var m3 = /CIGAR=([^;\t]+)/.exec(t[7]);
	var cigar = m3 != null? m3[1].split(",") : [];
	if (cigar.length && cigar.length != s.length) throw Error("Inconsistent ALT and CIGAR");
	// loop through each ALT allele
	for (var i = 0; i < s.length; ++i) {
		if (t[3].length == 1 && s[i].length == 1) { // SNP
			if (t[3] != s[i]) a.push([t[1], t[1]+1, 0, t[3], s[i], ACA[i+1], tot]);
		} else if (cigar.length) { // MNP or INDEL from freebayes
			var x = 0, y = 0;
			var m4, re = /(\d+)([MXID])/g;
			while ((m4 = re.exec(cigar[i])) != null) {
				var l = parseInt(m4[1]);
				if (m4[2] == 'X') {
					for (var j = 0; j < l; ++j) {
						var u = t[3].substr(x+j, 1), v = s[i].substr(y+j, 1);
						a.push([t[1] + x, t[1]+x+1, 0, u, v, ACA[i+1], tot]);
					}
					x += l, y += l;
				} else if (m4[2] == 'I') {
					if (x == 0 || y == 0) throw Error("Leading I/D");
					var u = t[3].substr(x-1, 1), v = s[i].substr(y-1, l+1);
					a.push([t[1] + x - 1, t[1]+x, l, u, v, ACA[i+1], tot]);
					y += l;
				} else if (m4[2] == 'D') {
					if (x == 0 || y == 0) throw Error("Leading I/D");
					var u = t[3].substr(x-1, l+1), v = s[i].substr(y-1, 1);
					a.push([t[1] + x - 1, t[1]+x+l, -l, u, v, ACA[i+1], tot]);
					x += l;
				} else if (m4[2] == 'M') x += l, y += l;
			}
		} else { // MNP or INDEL from Platypus and others
			var l = t[3].length < s[i].length? t[3].length : s[i].length;
			for (var j = 0; j < l; ++j) { // decompose long variants
				var u = t[3].substr(j, 1), v = s[i].substr(j, 1);
				if (u != v) a.push([t[1] + j, t[1]+j+1, 0, u, v, ACA[i+1], tot]);
			}
			var d = s[i].length - t[3].length;
			if (d != 0) a.push([t[1] + l - 1, t[1] + t[3].length, d, t[3].substr(l-1), s[i].substr(l-1), ACA[i+1], tot]);
		}
	}
	return a; // [start, end, indelLen, ref, alt, AC, tot]
}

var file = arguments.length == 0? new File() : new File(arguments[0]);
var buf = new Bytes();

while (file.readline(buf) >= 0) {
	var line = buf.toString();
	if (line.charAt(0) == '#') continue;
	var t = line.split("\t");
	var a = b8_parse_vcf_multi(t);
	for (var i = 0; i < a.length; ++i)
		print(t[0], a[i].join("\t"), t[6]);
}

buf.destroy();
file.close();
