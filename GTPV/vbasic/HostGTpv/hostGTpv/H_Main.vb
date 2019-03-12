Imports System.Text

Namespace hostGTpv

    Public Class H_main
        Public Shared Sub init(Optional ByVal controlInvoke As satServer.delControlInvoke = Nothing,
                               Optional ByVal userGTpv As String = "user1")
            satServer.idsSatAllowed.Clear()
            For i = 1 To 3
                satServer.idsSatAllowed.Add("Camarero-" & i)
            Next
            For i = 1 To 3
                satServer.idsSatAllowed.Add("Cocina-" & i)
            Next
            satServer.userGTpv = userGTpv
            fileHandlers.init()
            If controlInvoke IsNot Nothing Then satServer.ControlInvoke = controlInvoke
            satServer.registrationHandler = AddressOf satelliteRegistrationHandler
            satServer.run(80)
        End Sub

        Private Shared Function satelliteRegistrationHandler(ByVal sat As ISat, ByVal oldSat As ISat) As Boolean
            If oldSat IsNot Nothing Then unloadDataS(oldSat)
            loadDataS(sat, Sub()
                               '// ???? guardar info de satelite
                               '// init MenuPrincipal
                               Dim configSat = H_SatConfig.getConfig(sat)
                               If configSat("typeApp") = "camarero" Then
                                   sat.sendScript("var main=cam_createAppMain(); main.init(cam_layout.div); main.start();")
                               Else
                                   sat.sendScript(
                                        "menuPrincipal.menus =  " &
                                        "   menuPrincipal.createOptions(menuPrincipal.menusSatelliteExtern, menuPrincipal.opcionesMenu);" &
                                        "menuPrincipal.init();" &
                                        "menuPrincipal.start();")
                               End If
                           End Sub)
            Return True
        End Function

        Private Shared Sub loadDataS(ByVal sat As ISat, ByVal callback As Action)
            Call (Sub(callback2 As Action)
                      Dim cbm = New callbackManager(callback2)

                      H_Articles.createSat(sat, cbm.get())
                      H_Teclats.createSat(sat, cbm.get())
                      H_DosNivells.createSat(sat, cbm.get())
                      H_Dependentes.createSat(sat, cbm.get())
                      H_ConceptosEntrega.createSat(sat, cbm.get())
                      H_Caja.createSat(sat, True, cbm.get()) ' isAdim ??
                      H_Mesas.createSat(sat, cbm.get())

                      H_SatConfig.createSat(sat, cbm.get())

                      cbm.activate()
                  End Sub)(Sub()
                               Dim cbm = New callbackManager(callback)
                               H_Comandes.createSat(sat, cbm.get()) ' Comandes necesita que caja este inicializado
                               cbm.activate()
                           End Sub)
        End Sub

        Private Shared Sub unloadDataS(ByVal sat As ISat)
            H_Articles.destroySat(sat)
            H_Teclats.destroySat(sat)
            H_DosNivells.destroySat(sat)
            H_Dependentes.destroySat(sat)
            H_ConceptosEntrega.destroySat(sat)
            H_Comandes.destroySat(sat)
            H_Caja.destroySat(sat)
            H_SatConfig.destroySat(sat)
        End Sub

        Private Class callbackManager
            Private callback As action
            Private numGets As Integer
            Public activate As action
            Private lock As New Object()

            Public Sub New(ByVal callback As action)
                numGets = 0
                Me.callback = callback
                activate = [get]()
            End Sub

            Public Function [get]() As action
                SyncLock lock
                    numGets += 1
                    Return Sub()
                               SyncLock lock
                                   numGets -= 1
                                   If numGets <> 0 Then Return
                               End SyncLock
                               If callback IsNot Nothing Then callback()
                           End Sub
                End SyncLock
            End Function
        End Class

        Public Shared Function conversionForCompare(ByVal str As String)
            Const testChars = "àáäèéëìíïòóöùúüñç"
            Const replaceChars = "aaaeeeiiiooouuunc"
            Dim ret As New StringBuilder()
            For Each c In str.ToLower()
                Dim idx = testChars.IndexOf(c)
                ret.Append(If(idx = -1, c, replaceChars(idx)))
            Next
            Return ret.ToString()
        End Function

    End Class
End Namespace
