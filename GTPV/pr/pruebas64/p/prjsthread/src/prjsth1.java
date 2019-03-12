import javax.swing.JApplet;

import netscape.javascript.JSObject;


public class prjsth1 extends JApplet {
	private static final long serialVersionUID = 1L;
	private JSObject w;
	
	public void init() {
		w = JSObject.getWindow(this);
	}
	
	public void start() {
		prTh t = new prTh(w);	
		t.start();
	}
	
	public void button() {
		prTh t = new prTh(w);	
		t.start();
	}
}
