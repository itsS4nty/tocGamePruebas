(function () { // exec
	function findHost() {
		
		// cookies
		function setCookie(name, value) {
			document.cookie= name+"="+escape(value)+"; max-age="+10*365*24*60*60;
		}
		
		function getCookie(name) {
			var aC=document.cookie.split(";");
			for (var i=0; i<aC.length; i++) {
				var p = aC[i].indexOf("=");
				if (p === -1) continue;
				var x = aC[i].substr(0,p).replace(/^\s+|\s+$/g,'');
				if (x === name) {
					var y = aC[i].substr(p+1).replace(/^\s+|\s+$/g,'');
					return unescape(y);
				}
			}
			return null;
		}
		
		// jsonp
		var hostIdentArray = [];
		function hostIdent(user, ipLanHost, ipSat, idsSatAllowed, idsSat) { 
			hostIdentArray.push({
				user:user, ipLanHost:ipLanHost, ipSat:ipSat, 
				idsSatAllowed: idsSatAllowed, idsSat: idsSat
			});	
		}
		window.hostIdent = hostIdent; // called by <script>
		function findInHostIdent(user) {
			for (var i=0; i<hostIdentArray.length; i++) {
				if ((user == null) || (user === hostIdentArray[i].user)) 
					return hostIdentArray[i];
			}
			return null;
		}
		
		// tratamiento IP
		function ipv4(ip, maskPrefixLen) {
			ip = ip.split(".");
			var ipNum = 0;
			for (var j=0; j<4; j++) {
				var n = parseInt(ip[j]);
				ipNum = ipNum*256+n;
			}
			if (maskPrefixLen < 0) maskPrefixLen = 0;
			if (maskPrefixLen >32) maskPrefixLen = 32;
			var maskHost = (maskPrefixLen !== 32) ? (~0>>>maskPrefixLen) : 0;
			var ipHost = ipNum&maskHost;
			var ipNet = ipNum&(~maskHost);
			var c = 0;
			var n = Math.pow(2, 32-maskPrefixLen)-2; // 0..0, 1..1
			if (n<1) n=1; // al menos 1 host
			this.next = function() {
				if (c >= n) return null;
				var delta = ((c%2 === 0) ? (c>>>1) : (-(c>>>1)-1)); 
				var ipNum = ipNet|(((ipHost-1)+delta+n)%n)+1;
				var ip = [];
				for (var j=0; j<4; j++) {
					ip.unshift(ipNum & 0xFF);
					ipNum = ipNum>>>8;
				}
				ip = ip.join(".");
				c++;
				return ip;
			}
		}
		
		function ipv6(ip, maskPrefixLen) {
			var c = 0;
			this.next = function() {
				if (c >= 1) return null;
				c++;
				return ip;	
			}
		}
		
		
		function button(text) {
			return $("<button>").css({ display: "block", marginTop: "10px", width: "100%"}).text(text);	
		}

		
		// buscar direccion host 
		function connectToHost(user, ipHosts) {
			var maxConnections = 2;
			var connections = Array(maxConnections);
			var idxIpHosts = 0;
			var found = false;
			
			function tryHost(ip, callback, fFirst) {
				$("<div>").text("Scanning ... "+ip).appendTo(div1)[0].scrollIntoView();
				return $.ajax({
					url: "http://"+ip+"/_init/hostIdentS.php",
					dataType: "script",
					timeout: (fFirst ? 2000: 20000),
					success: function(data, textStatus, jqXHR) {
						var itemH = findInHostIdent(user);
						callback(jqXHR, itemH, ip);	
					},
					error: function(jqXHR) {
						callback(jqXHR, null);	
					}
				});
			}
			
			function nextIp() {
				for (var i=0; i<ipHosts.length; i++) {
					var ip = ipHosts[idxIpHosts].next();
					idxIpHosts = (idxIpHosts+1)%ipHosts.length;
					if (ip != null) return ip;
				}
				return null;
			}
			
			function callbackNextTryHost(jqXHR, itemH, ip) {
				connections[connections.indexOf(jqXHR)] = null;	
				if (itemH != null) {
					for (var i=0; i<connections.length; i++) {
						if (connections[i] != null) connections[i].abort();
					}	
					if (!found) {
						found = true;
						selectIdSat(itemH, ip);
					}
					return;
				} else nextTryHost();
			}
			
			function nextTryHost(fOnlyFirst) {
				if (fOnlyFirst) {
					var ip = nextIp();
					if (ip != null) {
						connections[0] = tryHost(ip, callbackNextTryHost, true);
						return;
					}
				}
				while(!found) {
					for (var i=0; i<connections.length; i++) 
						if (connections[i] == null) break;
					if (i === connections.length) return;
					var ip = nextIp();
					if (ip==null) {
						for (var i=0; i<connections.length; i++)
							if (connections[i] != null) break;
						if (i === connections.length) { 
							scanManual(user);
						}
						return;
					}
					connections[i] = tryHost(ip, callbackNextTryHost);
				}
			}
			
			if ((ipHosts == null) || (ipHosts === "")) {
				scanManual(user);
				return;
			}			

			div1.empty();	
			$("<div>").text(" Conectando con host: "+((user==null) ? "?" : user)).appendTo(div1);
			$("<div>").text(" ").appendTo(div1);
			button("Cancelar y regitrar manualmente").appendTo("body").width("50%").css("margin", "10px auto").click(function(e) {
				if (e.button !== 0) return;
				found = true; // no more scanning hosts
				for (var i=0; i<connections.length; i++) {
					if (connections[i] != null) connections[i].abort();
				}	
				scanManual(user);
			});
			ipHosts = ipHosts.split(" ");
			for (var i=0; i<ipHosts.length; ) {
				var ip = ipHosts[i];
				var maskPrefixLen;
				var m = ip.match(/(.*)\/(.*)/);
				if (m != null) {
					ip = m[1];
					maskPrefixLen = parseInt(m[2]); 	
					if (isNaN(maskPrefixLen)) maskPrefixLen = 24; 
				} else { 
					maskprefixLen = 24;
				}
				if (ip.indexOf(".") !== -1) {
					ipHosts[i++] = new ipv4(ip, maskPrefixLen);
				} else if (ip.indexOf(":") !== -1) {
					ipHosts[i++] = new ipv6(ip, maskPrefixLen);
				} else ipHosts.splice(i,1);	
			}
			idxIpHosts=0;
			nextTryHost(true);	
		}

		
		function scanManual(user) {
			div1.empty();
			div0.detach();
			$("body").empty();
			div0.appendTo("body");
			var input = $("<input>").attr("type", "text").appendTo(div1);
			$("<button>").text("Registrar").appendTo(div1).click(function(e) {
				if (e.button !== 0) return;
				connectToHost(user, input.val()+"/32");
			});
		}
		
		
		// seleccionar id de sat 
		function selectIdSat(itemH, ip) {
			function entryToHostApp(idSat) {
				setCookie("type", "sat");
				setCookie("user", itemH.user);
				setCookie("ipLanHost", itemH.ipLanHost);
				setCookie("id", idSat);

				$("body").empty();
				$("body").css({position:"absolute", margin:"0", border:"0", padding:"0", width:"100%", height:"100%"});
				var iframe = $("<iframe>");
				iframe.attr("src", "http://"+ip+"/entryS.html?id="+idSat);
				iframe.css({position:"absolute", margin:"0", border:"0", padding:"0", width:"100%", height:"100%"});
				iframe.appendTo("body");	
			}
			function getHandler(idSat) {
				return function(e) {
					if (e.button !== 0) return;

					entryToHostApp(idSat);
				}
			}
			
			var idSat = getCookie("id");
			if (idSat != null) entryToHostApp(idSat);
			else {
				div1.empty();
				for (var i=0; i<itemH.idsSatAllowed.length; i++)
					button("Asignar "+itemH.idsSatAllowed[i]).click(getHandler(itemH.idsSatAllowed[i])).appendTo(div1);
				for (var i=0; i<itemH.idsSat.length; i++)
					button("Reasignar "+itemH.idsSat[i]).click(getHandler(itemH.idsSat[i])).appendTo(div1);
			}
		}
		
		var div0;
		var div1;
		
		$(function() {
			var type = getCookie("type");
		
			$("body").css({position:"absolute", margin:"0", border:"0", padding:"0", width:"100%", height:"100%"});
			$("body").empty();
			div0 = $("<div>").css({width:"50%", height:"80%", margin:"0px auto", overflowY:"auto"}).appendTo("body");
			div1 = $("<div>").appendTo(div0);
			
			if (type === "sat") {
				var user = getCookie("user");
				var ipLanHost = getCookie("ipLanHost");
				if (ipLanHost == null) ipLanHost="";
				for (var i=0; i<hosts.length; i++) {
					if (hosts[i].user === user) {
						if (ipLanHost !== hosts[i].ipLan) {
							if (ipLanHost !== "") ipLanHost+=" "; 
							ipLanHost += hosts[i].ipLan;	
						}
						break;
					}
				}
				connectToHost(user, ipLanHost);
				return;
			}
			
			// type == null
			button("registrar como Host").click(function() {
				setCookie("type", "host");
				location.reload(true);
			}).appendTo(div1);
			for (var i=0; i<hosts.length; i++) {
				button("registrar como Sat de "+hosts[i].user).click(function(host) {
					return function(e) {
						if (e.button !== 0) return;
						connectToHost(host.user, host.ipLan);
					}
				}(hosts[i])).appendTo(div1);
			}
			button("registrar manualmente").click(function(e) {
				if (e.button !== 0) return;
				scanManual(null);
			}).appendTo(div1);
			
			
		});
	}
	if (window.H) {
		H.Scripts.add("_init/findHostS", "0", findHost);
	} else {
		findHost();	
	}
})();


