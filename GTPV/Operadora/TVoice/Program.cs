using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Rtc.Collaboration;
using Microsoft.Rtc.Collaboration.AudioVideo;

using System.Net;

namespace TVoice
{
    class Program
    {
        private static CollaborationPlatform _collabPlatform;
        private static ApplicationEndpoint _endpoint;
        public static string idTVoice { get; private set; }

        static void Main(string[] args)
        {
            // process args
            idTVoice = "TV1";

            InitializeUCMA();

            Console.WriteLine("Press Enter to stop.");
            Console.ReadLine();

            Cleanup();
        }

        static void InitializeUCMA()
        {
            ServerPlatformSettings platformSettings;
            platformSettings = new ServerPlatformSettings("TVoicePlatform",
                    Dns.GetHostEntry("localhost").HostName, 5060 /*Change this to the port of choice.*/, null);
            _collabPlatform = new CollaborationPlatform(platformSettings);
            _collabPlatform.EndStartup(_collabPlatform.BeginStartup(null, null));
 
            ApplicationEndpointSettings settings;
            String sipAddress = "sip:server@"+Dns.GetHostEntry("localhost").HostName;
            Console.WriteLine(sipAddress);

            settings = new ApplicationEndpointSettings(sipAddress);
            settings.IsDefaultRoutingEndpoint = true;

            _endpoint = new ApplicationEndpoint(_collabPlatform, settings);
            _endpoint.RegisterForIncomingCall<AudioVideoCall>(AudioVideoCallReceived);

            _endpoint.EndEstablish(_endpoint.BeginEstablish(null, null));
 
        }

        private static void AudioVideoCallReceived(object sender, CallReceivedEventArgs<AudioVideoCall> e)
        {
            AudioVideoCall call = e.Call as AudioVideoCall;
            CallManager manager = new CallManager(call);
            manager.run();
        }

        private static void Cleanup()
        {
 

            // Terminate the endpoint once the workflow runtime is finished.
            if (_endpoint != null)
            {
                _endpoint.EndTerminate(_endpoint.BeginTerminate(null, null));
                _endpoint = null;
            }
        }

    }
}

