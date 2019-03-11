<%

function MyGeocode(Texte,Lo,La)
	MyGeocode = false 
	Dim Rs 
	set Rs = Rec("Select * from Hit.Dbo.Geocodes Where Adresa = '" & Texte & "' Order By TmSt Desc ")
	if not rs.eof then
		Lo = Rs("Lo")
		La = Rs("La")
		MyGeocode = true
	end if
	
end function

%>
