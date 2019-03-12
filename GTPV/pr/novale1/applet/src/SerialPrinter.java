import javax.swing.*;
import gnu.io.*;

import java.security.*;
import java.util.*;
import java.io.*;

public class SerialPrinter extends JApplet {
	private static final long serialVersionUID = 1L;
	private SerialPort com;
	private SendThread st;
	private SerialPrinter ap;

	public void init() {
		System.out.println("init2");
		ap = this;
	}
	
	public String [] listPorts() {
		return AccessController.doPrivileged( new PrivilegedAction<String []>() {
			public String [] run() {
				@SuppressWarnings("unchecked")
				Enumeration e = CommPortIdentifier.getPortIdentifiers();
				ArrayList<String> a = new ArrayList<String>();
				while (e.hasMoreElements()) {
					CommPortIdentifier c = (CommPortIdentifier)e.nextElement();
					if (c.getPortType() ==  CommPortIdentifier.PORT_SERIAL) a.add(c.getName());
				}
				return a.toArray(new String[0]);
			}
		});
	}
	
	public boolean open(final String name, final int b, final int d, final int s, final int p) {
		return AccessController.doPrivileged( new PrivilegedAction<Boolean>() {
			public Boolean run() {
				ap.close();
				try {
					CommPortIdentifier portId = CommPortIdentifier.getPortIdentifier(name);
					if (portId.getPortType() != CommPortIdentifier.PORT_SERIAL) return false;
					ap.com = (SerialPort)portId.open("serial printer", 0);
					ap.com.setSerialPortParams(b, d, s, p);
				} catch (Exception e) {
					ap.close();
					e.printStackTrace();
					return false;
				}
				return true;
			}
		});
	}

	public boolean send(final byte [] b) {
		if (com == null) return false;
		if (st == null) {
			AccessController.doPrivileged( new PrivilegedAction<Void>() {
				public Void run() {
					ap.st = new SendThread();
					try {
						ap.st.stream = ap.com.getOutputStream();
					} catch (IOException e) {
					}
					ap.st.start();
					return null;
				}
			});
		}
		synchronized(st.ll) {
			st.ll.add(b);
			st.ll.notify();
		}
		return true;
	}	
			
	private class SendThread extends Thread {
		public LinkedList<byte []> ll = new LinkedList<byte []>();
		public OutputStream stream;
		public volatile boolean active = true;
		public void run() {
			while (active) {
				try {
					byte [] b;
					synchronized(ll) {
						if (ll.isEmpty()) ll.wait();
						b = ll.poll();
						if (b == null) continue; /* active == false o javascript byte [] == null */
					}
					stream.write(b);
//					stream.flush();
				} catch (Exception e) {
				}
			}
		}
	}
	
	public int read() {
		return AccessController.doPrivileged( new PrivilegedAction<Integer>() {
			public Integer run() {
				if (ap.com == null) return -2;
				try {
					InputStream i = com.getInputStream();
					if (i.available() > 0) {
						return i.read();
					} else return -1;
				} catch (IOException e) {
					return -3;
				}
			}
		});
	}	
			
	public void close() {
		AccessController.doPrivileged( new PrivilegedAction<Void>() {
			public Void run() {
				if (ap.com != null) {
					if (ap.st != null) {
						ap.st.active = false;
						synchronized(ap.st.ll) {
							ap.st.ll.notify();
						}
						ap.st = null;
					}
					ap.com.close();
					ap.com = null;
				}
				return null;
			}
		});
	}	
	
}
