import java.net.*;
import java.util.*;

public class net1 {
	public static void main(String[] args) {
		
		try {
			Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces();
			while (en.hasMoreElements()) {
				NetworkInterface n = en.nextElement();
				System.out.println(n.getDisplayName());
				System.out.println(n.getName());
				System.out.println(n.toString());
				byte b[] = n.getHardwareAddress();
				int i;
				if (b != null) for (i=0;i<b.length;i++) System.out.format("%02X ", b[i]);
				System.out.println();
				List<InterfaceAddress> lia = n.getInterfaceAddresses();
				Iterator<InterfaceAddress> ilia = lia.iterator();
				while (ilia.hasNext()) {
					InterfaceAddress ia = ilia.next();
					InetAddress a = ia.getAddress();
					System.out.println(a.getHostAddress());
					System.out.println(a.isSiteLocalAddress());
					System.out.println(a.isLoopbackAddress());
					System.out.println(ia.getNetworkPrefixLength());
					System.out.println(ia.getBroadcast().getHostAddress());
				}

			}
			
		} catch (Throwable e) {
			e.printStackTrace();
		}
	}
}
