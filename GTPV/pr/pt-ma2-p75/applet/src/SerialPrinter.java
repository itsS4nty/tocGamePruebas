import javax.swing.*;
import gnu.io.*;
import java.security.*;
import java.util.*;
//import java.io.*;
import netscape.javascript.*;

public class SerialPrinter extends JApplet {
	private static final long serialVersionUID = 1L;
	private HashSet<SerialPort> regSerialPort = new HashSet<SerialPort>();
	
	public void init() {
		System.out.println("init-3");
	}
	
/*	public String [] listPorts() {
		try {
		return AccessController.doPrivileged( new PrivilegedAction<String []>() {
			public String [] run() {
				try {
				Enumeration<?> e = CommPortIdentifier.getPortIdentifiers();
				ArrayList<String> a = new ArrayList<String>();
				while (e.hasMoreElements()) {
					CommPortIdentifier c = (CommPortIdentifier)e.nextElement();
					if (c.getPortType() ==  CommPortIdentifier.PORT_SERIAL) a.add(c.getName());
				}
				return a.toArray(new String[0]);
				} catch(Throwable e) { 
					System.out.println("in privileged"); 
					e.printStackTrace(); 
					System.out.println("--");
					e.getCause().printStackTrace();
					System.out.println("--");
					if (e instanceof Error) throw (Error)e;
					if (e instanceof RuntimeException) throw (RuntimeException)e;
					return null;
				}
			}
		});
		} catch(Throwable e) { System.out.println("out privileged"); e.printStackTrace(); return null; }
	}
*/
	public String [] listPorts() {
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

	
	public SerialPort open(final String name, final int b, final int d, final int s, final int p) {
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

	public void write(final SerialPort com, final byte [] b, final JSObject callback) {
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
			
	public void read(final SerialPort com, final int len, final JSObject callback) {
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
	
	public void close(final SerialPort com) {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				com.close();
				regSerialPort.remove(com);
				return null;
			}
		});
	}	

	public void stop() {
		Iterator<SerialPort> comIt = regSerialPort.iterator();
		while (comIt.hasNext()) comIt.next().close();
	}
	public String s() { return "qqqqq"; }
/*
	public void p1() {
		try {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				return null;
			}
		});
		} catch (Throwable e) { e.printStackTrace(); }
	}	

	public void p2() {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				return null;
			}
		});
	}	

	static public void main(String [] args) {
		Enumeration<?> e = CommPortIdentifier.getPortIdentifiers();
		while (e.hasMoreElements()) {
			System.out.println(((CommPortIdentifier)e.nextElement()).getName());
		}
		System.out.println("---------------------");	
		e = CommPortIdentifier.getPortIdentifiers();
		System.out.println("======================");	
		while (e.hasMoreElements()) {
			System.out.println(((CommPortIdentifier)e.nextElement()).getName());
		}
	}
*/	
	
}
