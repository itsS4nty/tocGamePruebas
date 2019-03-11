import java.io.*;
import java.net.*;

import com.sun.net.httpserver.*;

public class p1 {
	
	static String hostS = 
"	<html>"+
"	<head>"+
"	<script src='http://code.jquery.com/jquery-1.6.2.js'></script>"+
"	</head>"+
"	<body>"+
"	<script>"+
"	function communication(url, data) {"+
"		return $.ajax({" +
"			url: url, "+
"			contentType: 'plain/text',"+
"			timeout : 10000,"+
"			data : data,"+
"			type : 'POST',"+
"			success : success,"+
"			error : error"+
"		});"+
"	}"+
"	function send() {"+
"		communication('/hs/', '{idSat:1}');"+
"	}"+
"	function success(e) {"+
"		send();"+
"	}"+
"	function error(jqXHR, textStatus, errorThrown) {"+
"		send();"+
"	}"+
"	$(function() {"+
"		send();"+
"	});"+
"	</script>"+
"	</body>"+
"	</html>";

	static int cont=0;
	
	public static void main(String[] args) {
		final Object sync = new Object();
		System.out.println("main");
		final HttpServer httpS;
		try {
			InetSocketAddress isa = new InetSocketAddress((InetAddress)null, 80);
			httpS = HttpServer.create(isa, 0);
		} catch (Exception e) {
			e.printStackTrace();
			return;
		}
		httpS.createContext("/", new HttpHandler() {
			public void handle(final HttpExchange ex) {
				String path    = ex.getRequestURI().getPath();
				System.out.println("path: "+(++cont)+" "+path);
				ex.getResponseHeaders().add("Cache-Control", "no-cache");
				ex.getResponseHeaders().add("Conection", "close");
				if (path.equals("/")) {
					try {
					ex.getResponseHeaders().add("Content-Type", "text/html");
					byte [] b = hostS.getBytes("UTF-8");
					ex.sendResponseHeaders(200, b.length);
					ex.getResponseBody().write(b);
					ex.getResponseBody().close();
					} catch(Exception e) {
					}
					return;
				} 
				final InputStream is = ex.getRequestBody(); 
//				try { is.read(); } catch (IOException e) {}
//				(new Thread() {public void run() {System.out.println("w");} }).start();
				(new Thread() {
					public void run() {
//						try { sleep(100); } catch (Exception e) {}
						int n = 0;
						try {
							do {
								n = is.read();
							} while (n >= 0);
							System.out.println("end read");
						} catch(Exception e) { 
							e.printStackTrace(System.out);	
							ex.close();
//							httpS.stop(1);
							synchronized(sync) { sync.notify(); }	
							return; 
						}
						try {
							ex.sendResponseHeaders(401, -1);
							ex.getResponseBody().close();
						} catch(Exception e) { 
							e.printStackTrace(System.out);	
							ex.close();
							synchronized(sync) { sync.notify(); }	
							return;	
						}
						ex.close();
					}	
				})./*start*/run();
			}
		});
		httpS.start();
		synchronized (sync) {
		try {
			sync.wait();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		}
		System.out.println("pre stop");
		httpS.stop(0);
		System.out.println("post stop");
	}
}

