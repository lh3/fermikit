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

var c, show_filtered = false, min_len = 100, max_len = 100000;

while ((c = getopt(arguments, "fl:L:")) != null) {
	if (c == 'f') show_filtered = true;
	else if (c == 'l') min_len = parseInt(getopt.arg);
	else if (c == 'L') max_len = parseInt(getopt.arg);
}

var file = arguments.length == getopt.ind? new File() : new File(arguments[getopt.ind]);
var buf = new Bytes();

while (file.readline(buf) >= 0) {
	var line = buf.toString();
	var m, t = line.split("\t");
	if (t.length >= 6 && /\tTYPE:DELETION/.test(line) && (m = /\tMAX:([^:\s]+):(\d+);([^:\s]+):(\d+)/.exec(line)) != null) { // bedpe produced by LUMPY
		if (m[1] == m[3]) print(m[1], parseInt(m[2])-1, m[4], t[t.length-1]);
		else warn("WARNING: different contig names");
	} else if (/^\d+$/.test(t[1]) && /^\d+$/.test(t[2]) && /^\d+$/.test(t[4]) && /^\d+$/.test(t[5]) && t[0] == t[3]) {
		var start = parseInt(t[1]) < parseInt(t[4])? t[1] : t[4];
		var end   = parseInt(t[2]) > parseInt(t[5])? t[2] : t[5];
		print(t[0], start, end);
	} else if (line.charAt(0) != '#' && t.length >= 8 && /^\d+$/.test(t[1]) && (m = /\bEND=(\d+)/.exec(t[7])) != null) { // VCF
		if (t.length >= 10 && /^0[\/|]0/.test(t[9])) continue; // 0/0 genotype
		var end = m[1];
		if (/\bSVTYPE=DEL/.test(t[7]) || /<DEL>/.test(t[4])) {
			if (min_len > 0 && (m = /\bSVLEN=(-?\d+)/.exec(t[7])) != null) {
				var l = parseInt(m[1]);
				if (l < 0) l = -l;
				if (l < min_len || l > max_len) continue;
			}
			if (show_filtered || t[6] == 'PASS' || t[6] == '.')
				print(t[0], parseInt(t[1])-1, end, t[6]);
		}
	} else if (t.length >= 6 && t[0] == 'D' && /^\d+/.test(t[2]) && /^\d+/.test(t[3])) { // htsbox abreak
		for (var i = 2; i <= 5; ++i) t[i] = parseInt(t[i]); 
		print(t[1], t[2]<t[3]+t[4]? t[2]:t[3]+t[4], t[3]>t[2]-t[4]?t[3]:t[2]-t[4]);
	}
}

buf.destroy();
file.close();
