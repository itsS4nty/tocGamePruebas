import java.io.*;
import java.net.*;
import java.security.*;
import java.util.*;
import gnu.io.*;
import javax.swing.JApplet;

import com.sun.net.httpserver.*;

import netscape.javascript.JSObject;


public class g_applet extends JApplet {
	private static final long serialVersionUID = 1L;
	private HashSet<HttpServer> regHttpServer = new HashSet<HttpServer>();
	private HashSet<HttpExchange> regHttpExchange = new HashSet<HttpExchange>();
		
	public HttpServer http_create(final int port, final String addr, final int backlog) {
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
	
	public HttpContext http_createContext(final HttpServer httpS, final String path, final JSObject handler) {
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
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				httpS.start();
				return null;
			}
		});
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
	
/*	public void httpEx_response(final HttpExchange httpEx, final int rCode, final byte [] b, final JSObject callback) {
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
*/
	

	public void httpEx_response_String_u0100(final HttpExchange httpEx, final int rCode, final String str, final JSObject callback) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				(new Thread() {
					public void run() {
						boolean ret = true;
						try {
							byte [] b = null;
							if (str != null) {
								b = str.replace('\u0100', '\0').getBytes("ISO-8859-1");
							}	
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
	

	public void httpEx_response_String(final HttpExchange httpEx, final int rCode, final String str, final boolean utf8, final JSObject callback) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				(new Thread() {
					public void run() {
						boolean ret = true;
						try {
							byte [] b = (str != null) ? str.getBytes(utf8 ? "UTF-8" : "ISO-8859-1") : null;
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
	
	public byte [] b1(String str) {
		System.out.println(str.length());
		try {
			return str.getBytes("UTF-8"); 
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	public byte [] b2(String str) {
		System.out.println(str.length());
		try {
			return str.getBytes("ISO-8859-1");
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	public byte [] b3(String str, boolean utf8) {
		System.out.println(str.length());
		try {
			return str.getBytes(utf8 ? "UTF-8" : "ISO-8859-1");
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	public byte [] c1(char c[]) {
		System.out.println(c.length);
		return null;
	}

	public byte [] c2(byte c[]) {
		System.out.println(c.length);
		int i;
		for (i=0; i<c.length; i++) System.out.println(c[i]);
		byte c2 [] = new byte [c.length];
		for (i=0; i<c.length; i++) c2[i] = c[i];
		
		return c2;
	}
	
	public void httpEx_close(final HttpExchange httpEx) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				(new Thread() {
					public void run() {
						close_Impl(httpEx);
					}		
				}).start();
				return null;
			}
		});
	}
	
	private void close_Impl(HttpExchange httpEx) {
		httpEx.close();
		regHttpExchange.remove(httpEx);
	}
	
	public String[] http_getSiteLocalAddresses() {
		return AccessController.doPrivileged( new PrivilegedAction<String []>() {
			public String [] run() {
				ArrayList<String> a = new ArrayList<String>();
				try {
					Enumeration<NetworkInterface> ne = NetworkInterface.getNetworkInterfaces();
					while(ne.hasMoreElements()) {
						NetworkInterface n = ne.nextElement();
						Enumeration<InetAddress> ie = n.getInetAddresses();
						while(ie.hasMoreElements()) {
							InetAddress i = ie.nextElement();
							if (i.isSiteLocalAddress() && !i.isLoopbackAddress()) {
								a.add(i.getHostAddress());
							}
						}
					}	
				} catch (SocketException e) {
					e.printStackTrace();
				}
				return a.toArray(new String[0]);
			}
		});
	}

	
	private HashSet<SerialPort> regSerialPort = new HashSet<SerialPort>();
	
	public String [] serial_listPorts() {
		return AccessController.doPrivileged( new PrivilegedAction<String []>() {
			public String [] run() {
				Enumeration<?> e = CommPortIdentifier.getPortIdentifiers();
				ArrayList<String> a = new ArrayList<String>();
				while (e.hasMoreElements()) {
					CommPortIdentifier c = (CommPortIdentifier)e.nextElement();
					if (c.getPortType() ==  CommPortIdentifier.PORT_SERIAL) a.add(c.getName());
				}
				return a.toArray(new String[0]);
			}
		});
	}

	
	public SerialPort serial_open(final String name, final int b, final int d, final int s, final int p) {
		return AccessController.doPrivileged( new PrivilegedAction<SerialPort>() {
			public SerialPort run() {
				SerialPort com = null;
				try {
					CommPortIdentifier portId = CommPortIdentifier.getPortIdentifier(name);
					if (portId.getPortType() != CommPortIdentifier.PORT_SERIAL) return null;
					com = (SerialPort)portId.open("serial printer", 1);
					com.setSerialPortParams(b, d, s, p);
					regSerialPort.add(com);
					return com;
				} catch (Exception e) {
					if (com != null) com.close();
					return null;
				}
			}
		});
	}

	public void serial_write(final SerialPort com, final byte [] b, final JSObject callback) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				(new Thread(){
					public void run() {
						boolean ret;
						try {
							com.getOutputStream().write(b);
							ret = true;
						} catch(Exception e) {
							ret = false;
						}
						if (callback != null) callback.call("call", new Object []{null, ret});
					}
				}).start();
				return null;	
			}
		});
	}	
			
	public void serial_read(final SerialPort com, final int len, final JSObject callback) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				(new Thread() {
					public void run() {
						byte [] b = new byte[len];
						int n = 0;
						byte [] ret;	
						try {
							n = com.getInputStream().read(b);
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
	
	public void serial_close(final SerialPort com) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				com.close();
				regSerialPort.remove(com);
				return null;
			}
		});
	}	

	public void init() {
		System.out.println("init g_applet");
	}
	
	public void start() {
		System.out.println("start g_applet");
	}
	
	public void stop() {
		Iterator<HttpExchange> httpExIt = regHttpExchange.iterator();
		while (httpExIt.hasNext()) httpExIt.next().close();
		Iterator<HttpServer> httpSIt = regHttpServer.iterator();
		while (httpSIt.hasNext()) httpSIt.next().stop(0);

		Iterator<SerialPort> comIt = regSerialPort.iterator();
		while (comIt.hasNext()) comIt.next().close();
	}
	
	public static void main2(String[] args) {
/*		g_applet j = new g_applet();
		HttpServer h = j.http_create(80, null, 0);
		System.out.println(h);	
		HttpServer h2 = j.http_create(80, null, 0);
		System.out.println(h2);	
*/	
		g_applet j = new g_applet();
		String a [] = j.serial_listPorts();
		System.out.println(a[0]);
	}
	
	public static void main(String[] args) {
	//	g_applet j = new g_applet();
//		char ac [] = new char[4];
		int i;
//		for (i=0; i<128; i++) ac[i] = (char)(i+128);
/*		ac[0] = 0x40;
		ac[1] = 0;
		ac[2] = 1;
		ac[3] = 0x30;
		String str = new String(ac);
		boolean utf8 = false;
		try {
		byte b [] = str.getBytes(utf8 ? "UTF-8" : "ISO-8859-1");
		for (i=0; i<b.length; i++)
			System.out.println((int)b[i] & 0xFF);
		} catch (Throwable e) {
			e.printStackTrace();
		}
*/
		String s = "\u0040\u0100\0Ā";
		for (i=0; i<s.length(); i++)
			System.out.println((int)(char)s.charAt(i)+" "+s.charAt(i));
		String s1 = s.replace('\u0100', '\0');
		for (i=0; i<s1.length(); i++)
			System.out.println((int)(char)s1.charAt(i)+" "+s1.charAt(i));
		
		
	}	
}

