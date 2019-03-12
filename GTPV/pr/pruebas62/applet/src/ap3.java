import javax.swing.*;
import gnu.io.*;
import java.util.*;
import java.io.*;

public class ap3 extends JApplet {
	private static final long serialVersionUID = 1L;
	private SerialPort com;
	private volatile boolean inUse;
	
	@SuppressWarnings("unchecked")
	public String [] listPorts() {
		Enumeration e = CommPortIdentifier.getPortIdentifiers();
		ArrayList<String> a = new ArrayList<String>();
		while (e.hasMoreElements()) {
			CommPortIdentifier c = (CommPortIdentifier)e.nextElement();
			if (c.getPortType() ==  CommPortIdentifier.PORT_SERIAL) a.add(c.getName());
		}
		return a.toArray(new String[0]);
	}
	
	public boolean open(String name, int b, int d, int s, int p) {
		close();
		try {
			CommPortIdentifier portId = CommPortIdentifier.getPortIdentifier(name);
			if (portId.getPortType() != CommPortIdentifier.PORT_SERIAL) return false;
			com = (SerialPort)portId.open("serial printer", 0);
			com.setSerialPortParams(b, d, s, p);
		} catch (Exception e) {
			close();
			return false;
		}
		return true;
	}

	
	public boolean send(String s) {
		if (com == null) return false;
		if (inUse) return false;
		if (s == null) return true;
		SendThread st = new SendThread();
		try {
			st.b = s.getBytes("ISO-8859-1");
		} catch (Exception e) {
			return false;
		}
		inUse = true;
		st.start();
		return true;
	}

	private class SendThread extends Thread {
		public byte [] b;
		public void run() {
			try {
				OutputStream o = com.getOutputStream();	
				o.write(b);
				o.flush();
			} catch (IOException e) {
			}
			inUse = false;
		}
	}
	
	public int read() {
		if (com == null) return -2;
		try {
			InputStream i = com.getInputStream();
			if (i.available() > 0) {
				return i.read();
			} else return -1;
		} catch (IOException e) {
			return -3;
		}
	}
	
	public void close() {
		if (com != null) {
			com.close();
			com = null;
			inUse = false;	
		}
	}

}

