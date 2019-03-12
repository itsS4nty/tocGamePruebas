import java.security.*;
import java.util.*;
import gnu.io.*;

import netscape.javascript.JSObject;


public class g_Serial {
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

	public void appletStop() {
		Iterator<SerialPort> comIt = regSerialPort.iterator();
		while (comIt.hasNext()) comIt.next().close();
	}

}

