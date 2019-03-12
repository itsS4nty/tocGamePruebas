=-=-=--=-=-=-=-=-==-=-=-=-=-=
Requirements
=-=-=--=-=-=-=-=-==-=-=-=-=-=
Version: For use with the Microsoft Speech Platform SDK v11.0

Installation:

 - Make sure you have already installed the Microsoft Speech Platform Runtime (e.g., "SpeechPlatformRuntime.msi").
 - Make sure you have already installed the Microsoft Speech Platform SDK (e.g., "MicrosoftSpeechPlatformSDK.msi").
 - Ensure that you have installed a local recognizer such as the local EN-US engine (e.g., "MSSpeech_SR_en-US_TELE.msi") which available for download from the web.


=-=-=--=-=-=-=-=-==-=-=-=-=-=
Folder contents
=-=-=--=-=-=-=-=-==-=-=-=-=-=
This folder contains files to demonstrate the Simulator.exe tool in order to simulate recogtion results through a locally installed recognizer.

This package includes the following files:

1) A set of audio files.

2) A set of grammars.

3) Sample_InputToSimulator.xml: A sample input file to Simulator which indicates 11 wave files with associated transcriptions and grammars to process 
   through Simulator.

4) Sample_OutputFromSimulator-InputToSimulatorResultsAnalyzer.xml: A sample output file which shows the results of running the input file through Simluator.

5) Sample_OutputFromSimulatorResultsAnalyzer.xml: A sample output file from SimulatorResultsAnalyzer.exe.

=-=-=--=-=-=-=-=-==-=-=-=-=-=
Before running Simulator.exe
=-=-=--=-=-=-=-=-==-=-=-=-=-=

The sample input file ("Sample_EMMA_Input.xml") references the two supporting folders ("grammars" and "waves"). You will need to place the "grammars" and "waves" folders in the same folder as the simulator.exe tool.


=-=-=--=-=-=-=-=-==-=-=-=-=-=
Example Simulator.exe run
=-=-=--=-=-=-=-=-==-=-=-=-=-=

Simulator.exe takes an input file in EMMA XML format (W3C standard) that contains a set of utterance references (i.e., wave files), their transcriptions, and grammar references. Simulator performs recognition based on the recognizer configuration and then outputs the results in EMMA XML format.  The resulting output is a rich set of information based on the recognition results.

Run the following from the command line:

> Simulator.exe -In "..\Samples\Sample Simulator\Sample_InputToSimulator.xml" -Out myOutputFile.xml -RecoConfig "..\Samples\Sample Configurations\RecoConfig_Local_Engine_Example.xml"

Info: Starting
Info: Completed getting transcript semantics of utterance utterance_0.0.1.0
Info: Completed getting transcript semantics of utterance utterance_0.0.0.0
Info: Completed recognizing utterance utterance_0.0.1.0
Info: Completed recognizing utterance utterance_0.0.0.0
Info: Completed recognizing utterance utterance_0.0.2.0
Info: Completed getting transcript semantics of utterance utterance_0.0.3.0
Info: Completed recognizing utterance utterance_0.0.4.0
Info: Completed getting transcript semantics of utterance utterance_0.0.2.0
Info: Completed recognizing utterance utterance_0.0.3.0
Info: Completed getting transcript semantics of utterance utterance_0.0.4.0
Info: Completed getting transcript semantics of utterance utterance_0.0.5.0
Info: Completed recognizing utterance utterance_0.0.6.0
Info: Completed recognizing utterance utterance_0.0.5.0
Info: Completed getting transcript semantics of utterance utterance_0.0.6.0
Info: Completed getting transcript semantics of utterance utterance_0.0.7.0
Info: Completed getting transcript semantics of utterance utterance_0.0.8.0
Info: Completed recognizing utterance utterance_0.0.8.0
Info: Completed recognizing utterance utterance_0.0.7.0
Info: Completed getting transcript semantics of utterance utterance_0.0.9.0
Info: Completed recognizing utterance utterance_0.0.9.0
Info: Completed getting transcript semantics of utterance utterance_0.0.10.0
Info: Completed recognizing utterance utterance_0.0.10.0
Info: Completed 22 recognitions: 0 errors.
Processing Complete: 0 Error(s). 0 Warning(s)

>

=-=-=--=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=
Example SimulatorResultsAnalyzer.exe run
=-=-=--=-=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=-=

SimulatorResultsAnalyzer.exe takes the output from Simulator.exe in order to generate an analysis of the overall recognition performance. The resulting output XML can be used to generate graphical reports or summaries of the recognition performance. (Note, the SDK does not currently contain any graphical tools in which to view the results.)


> SimulatorResultsAnalyzer.exe -In myOutputFile.xml -Out myOutputFile.Analyzed.xml

Info: C:\Users\jaywaltm.REDMOND\Desktop\M3 SDK ZABB build 7413.85\Tools\myOutputFile.xml: 11 utterances read
Info: Processed 1/1 input files
Info: 11 utterances analyzed
Info: Successfully output details to "myOutputFile.Analyzed.xml"
Processing Complete: 0 Error(s). 0 Warning(s)

>

In the example above, "myOutputFile.Analyzed.xml" would contain the same content as the file "Sample_OutputFromSimulatorResultsAnalyzer.xml" provided under the "<SDK>\Samples\Sample Simulator\" folder.

See the SDK Help documentation (under <SDK>\docs\MicrosoftSpeechPlatformSDK.chm) on interpreting the output XML results.



[end of file.]