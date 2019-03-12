using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Rtc.Collaboration;
using Microsoft.Rtc.Collaboration.AudioVideo;
using System.Net;
using System.Threading;
using System.Xml;
using System.Xml.Linq;
using Microsoft.Speech.Synthesis;
using System.Globalization;
using Microsoft.Speech.AudioFormat;
using System.IO;

namespace TVoice
{
    class CallManager
    {
        private CookieContainer cookies;
        private AudioVideoCall call;
        private Object session;
        private int state;
        private Object lockObj = new Object();
        private String processor;
        public CallManager(AudioVideoCall _call)
        {
            call = _call;
            cookies = null; // new CookieContainer();
            processor = "http://www.google.com"; // global processor
        }

        public void run() {
           XElement ev = createEventCall(call);
           SendEvent(ev);
           call.StateChanged += this.CallStateChanged;

            Console.WriteLine("DisplayName: {0} SipURI: {1}", 
                call.RemoteEndpoint.Participant.DisplayName,  call.RemoteEndpoint.Participant.Uri);
            call.EndAccept(call.BeginAccept(null, null));
            Console.WriteLine("Call Accepted");
            SpeechSynthesizer ss = new SpeechSynthesizer();
            ss.SelectVoiceByHints(VoiceGender.NotSet, VoiceAge.NotSet, 0, new CultureInfo("es-ES"));
            SpeechSynthesisConnector ssc = new SpeechSynthesisConnector();
            ssc.AttachFlow(call.Flow);
            ssc.Start();
            ss.SetOutputToAudioStream(ssc.Stream, new SpeechAudioFormatInfo(16000,AudioBitsPerSample.Sixteen, 
                Microsoft.Speech.AudioFormat.AudioChannel.Mono));
            ss.Speak("Hola adios");
            ssc.Stop();
            ssc.DetachFlow();
            Thread.Sleep(7000);
            call.EndTerminate(call.BeginTerminate(null, null));
            Console.WriteLine("Call Terminated");

        }

        private void SendEvent(XElement ev)
        {
            try
            {
                XElement postData = new XElement("TVoice",
                        new XElement("id",
                            new XAttribute("name", Program.idTVoice)),
                        new XElement("session"),
                        ev);
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(processor);
                req.Method = "POST";
                req.CookieContainer = cookies;
                req.ContentType = "text/xml; charset=utf-8";
                req.Timeout = 10000;
                Stream reqStream = req.GetRequestStream();

                XmlWriterSettings settings = new XmlWriterSettings();
                settings.Encoding = Encoding.UTF8;
                settings.Indent = true;

                XmlWriter writer = XmlWriter.Create(reqStream, settings);
                postData.Save(writer);
                reqStream.Close();

                HttpWebResponse resp = (HttpWebResponse)req.GetResponse();
                XmlReader reader = XmlReader.Create(resp.GetResponseStream());
                XElement respData = XElement.Load(reader);
                processResponse(respData);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }

        private void processResponse(XElement resp)
        {

        }

        private XElement createEventCall(Call call) {
            XElement evCall = new XElement("event",
                    new XAttribute("type", "call"),
                    new XElement("DisplayName", call.RemoteEndpoint.Participant.DisplayName),
                    new XElement("Uri", call.RemoteEndpoint.Participant.Uri)
                );
            return evCall;
        
        }

        private void CallStateChanged(Object sender, CallStateChangedEventArgs e)
        {
            Console.WriteLine("{0} - {1} - {2}", e.PreviousState, e.State, e.TransitionReason);
        }
        

     }
}
