import java.applet.Applet;


public class a1 extends Applet {
	public void init() {
		System.out.println("a1->");
		System.out.println(System.getProperty("user.dir"));
		System.out.println("a1-<");
	}
	
	public static void main(String [] args) {
		a1 a = new a1();
		a.init();
	}
}
