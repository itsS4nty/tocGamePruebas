import netscape.javascript.JSObject;

public class prTh extends Thread {
	private JSObject window;
	
	public prTh(JSObject _win) {
		window = _win;
	}
	
	public void run() {
		try {
			Thread.sleep(2000);
		} catch(Exception e) {
		}
		Object [] o = {"thread"};
		window.call("funAlert", o);
	}
}
 