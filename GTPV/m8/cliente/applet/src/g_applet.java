import java.applet.Applet;

public class g_applet extends Applet {
	private static final long serialVersionUID = 1L;
	
	private g_HttpServer httpServer;
	private g_Serial serial;
	
	public g_applet() {
		httpServer = new g_HttpServer();
		serial = new g_Serial();
	}
	
	public g_HttpServer getHttpServer() {
		return httpServer;
	}
	public g_Serial getSerial() {
		return serial;
	}
	
	public void init() {
		System.out.println("init g_applet-2");
	}
	
	public void start() {
		System.out.println("start g_applet");
	}
	
	public void stop() {
		System.out.println("stop g_applet");
		httpServer.appletStop();
		serial.appletStop();
	}

	public void destroy() {
		System.out.println("destroy g_applet");
	}

}

