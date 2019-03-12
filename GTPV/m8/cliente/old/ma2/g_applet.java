import java.io.*;
import java.net.*;
import java.security.*;
import java.util.*;
import javax.swing.JApplet;

import com.sun.net.httpserver.*;

import netscape.javascript.JSObject;

public class g_applet extends JApplet {
	private static final long serialVersionUID = 1L;
	private HashSet<HttpServer> regHttpServer = new HashSet<HttpServer>();
	private HashSet<HttpExchange> regHttpExchange = new HashSet<HttpExchange>();
	
	public void init() {
	}

	public HttpServer HttpServer_create(final int port, final String addr, final int backlog) {
		return AccessController.doPrivileged( new PrivilegedAction<HttpServer>() {
			public HttpServer run() {
				try {
					InetSocketAddress isa = 
						new InetSocketAddress((addr == null) ? null: InetAddress.getByName(addr), port);
					HttpServer httpS = HttpServer.create(isa, backlog);
					regHttpServer.add(httpS);
					return httpS;
				} catch (Exception e) {
					e.printStackTrace();
					return null;
				}
			}
		});	
	}
	
	public HttpContext http_createHttpContext(final HttpServer httpS, final String path, final JSObject handler) {
		return AccessController.doPrivileged( new PrivilegedAction<HttpContext>() {
			public HttpContext run() {
				return httpS.createContext(path, new HttpHandler() {
					public void handle(HttpExchange ex) {
						regHttpExchange.add(ex);
						String method  = ex.getRequestMethod().toUpperCase();
						String path    = ex.getRequestURI().getPath();
						String query   = ex.getRequestURI().getQuery();
						String address = ex.getRemoteAddress().getAddress().getHostAddress();
						handler.call("call", new Object [] {null, ex, method, path, query, address});
					}
				});
			}
		});
	}

	public void http_start(final HttpServer httpS) {
		try {
			AccessController.doPrivileged( new PrivilegedAction<Void>() {
				public Void run() {
					try {
					httpS.start();
					return null;
					} catch(Throwable e) {
						System.out.println("1-");
						e.printStackTrace();
					}
					return null;
				}
			});
		} catch(Throwable e) {
			System.out.println("2-");
			e.printStackTrace();
		}
	}

	public void http_stop(final HttpServer httpS) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				httpS.stop(0);
				regHttpServer.remove(httpS);
				return null;
			}
		});
	}

	public Headers httpEx_requestHeader(final HttpExchange httpEx) {
		return AccessController.doPrivileged( new PrivilegedAction<Headers>() {
			public Headers run() {
				return httpEx.getRequestHeaders();
			}
		});
	}
	
	public void httpEx_requestBody(final HttpExchange httpEx, final int len, final JSObject callback) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				(new Thread() {
					public void run() {
						byte [] b = new byte[len];
						int n = 0;
						byte [] ret;	
						try {
							n = httpEx.getRequestBody().read(b);
							if (n == -1) n = 0;
							ret = new byte[n];
							for (int i=0; i<n; i++) ret[i] = b[i];
						} catch(Exception e) { 
							e.printStackTrace();	
							ret = null; 
						}
						if (callback != null) callback.call("call", new Object [] {null, ret});
					}		
				}).start();
				return null;
			}
		});
	}

	public void httpEx_requestBody_UTF8(final HttpExchange httpEx, final Reader r, final int len, final JSObject callback) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				(new Thread() {
					public void run() {
						char [] cBuf = new char[len];
						int n;
						Reader r2 = r;
						String ret;
						try {
							if (r2 == null) r2 = new InputStreamReader(httpEx.getRequestBody(), "UTF-8");
							n = r2.read(cBuf);
							if (n == -1) n = 0;
							ret = new String(cBuf, 0, n);
						} catch(Exception e) { 
							e.printStackTrace();	
							ret = null; 
						}
						if (callback != null) callback.call("call", new Object [] {null, ret, r2});
					}		
				}).start();
				return null;
			}
		});
	}

	public void httpEx_responseHeader(final HttpExchange httpEx, final String key, final String value) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				httpEx.getResponseHeaders().add(key, value);
				return null;
			}
		});
	}
	
	public void httpEx_response(final HttpExchange httpEx, final int rCode, final byte [] b, final JSObject callback) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				(new Thread() {
					public void run() {
						boolean ret = true;
						try {
							httpEx.sendResponseHeaders(rCode, (b != null) ? b.length : -1);
							if (b != null) httpEx.getResponseBody().write(b);
							httpEx.getResponseBody().close();
						} catch(Exception e) { 
							e.printStackTrace();	
							ret = false; 
						}
						if (callback != null) callback.call("call", new Object [] {null, ret});
						else close_Impl(httpEx);
					}		
				}).start();
				return null;
			}
		});
	}
	
	public void httpEx_response_UTF8(final HttpExchange httpEx, final int rCode, final String str, final JSObject callback) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				(new Thread() {
					public void run() {
						boolean ret = true;
						try {
							byte [] b = (str != null) ? str.getBytes("UTF-8") : null;
							httpEx.sendResponseHeaders(rCode, (b != null) ? b.length : -1);
							if (b != null) httpEx.getResponseBody().write(b);
							httpEx.getResponseBody().close();
						} catch(Exception e) { 
							e.printStackTrace();	
							ret = false; 
						}
						if (callback != null) callback.call("call", new Object [] {null, ret});
						else close_Impl(httpEx);	
					}		
				}).start();
				return null;
			}
		});
	}

	public void httpEx_close(final HttpExchange httpEx, final JSObject callback) {
		try {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				(new Thread() {
					public void run() {
						close_Impl(httpEx);
						if (callback != null) callback.call("call", new Object [] {null});
					}		
				}).start();
				return null;
			}
		});
		} catch(Throwable e) {
			e.printStackTrace();
		}
	}
	
	private void close_Impl(final HttpExchange httpEx) {
		httpEx.close();
		regHttpExchange.remove(httpEx);
	}
	
	public void stop() {
		Iterator<HttpExchange> httpExIt = regHttpExchange.iterator();
		while (httpExIt.hasNext()) httpExIt.next().close();
		Iterator<HttpServer> httpSIt = regHttpServer.iterator();
		while (httpSIt.hasNext()) httpSIt.next().stop(0);
	}

	public static void main(String[] args) {
		g_applet j = new g_applet();
		HttpServer h = j.HttpServer_create(80, null, 0);
		System.out.println(h);	
		HttpServer h2 = j.HttpServer_create(80, null, 0);
		System.out.println(h2);	
	}
}

