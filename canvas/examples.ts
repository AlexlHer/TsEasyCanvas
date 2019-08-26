// Auteur : Alexandre l'Heritier

// On initialise le canvas et on lui donne l'id de l'élement html canvas (dans index.html).
var can: Canvas = init_canvas("canvas1");

// On lui donne un élement dans lequel afficher le niveau de zoom.
can.set_elem_affichage_zoom(document.getElementById("zoom"));

// On ajoute quelques points.
can.add_points(0, [new Point(0, 0), new Point(1, 0), new Point(1, 1)]);

// On affiche un petit texte pendant 5 sec.
can.set_texte_canvas("EasyCanvas v0.5.190826.1", 5000);

// On lie les élements de la page aux méthodes de l'objet can.
document.getElementById("origine_au_centre").onclick = () => 
	can.origine_au_centre();

document.getElementById("cadrillage").onchange = () => 
	can.set_affiche_cadrillage((document.getElementById("cadrillage") as HTMLInputElement).checked);

document.getElementById("repere").onchange = () => 
	can.set_affiche_repere((document.getElementById("repere") as HTMLInputElement).checked);

// onmousemove car onclick n'actualise que lors du relachement de la touche.
document.getElementById("taille_chiffre_axes").onmousemove = () => {
	can.set_taille_chiffre(parseInt((document.getElementById("taille_chiffre_axes") as HTMLInputElement).value));
	document.getElementById("span_taille_chiffre_axes").innerHTML = (document.getElementById("taille_chiffre_axes") as HTMLInputElement).value;
}

document.getElementById("auto_pas_chiffre").onchange = () => {
	if ((document.getElementById("auto_pas_chiffre") as HTMLInputElement).checked){
		can.set_pas_auto(true);
		(document.getElementById("pas_chiffre_axes") as HTMLInputElement).disabled = true;
	}
	else{
		can.set_pas_auto(false);
		(document.getElementById("pas_chiffre_axes") as HTMLInputElement).disabled = false;
	}
}

document.getElementById("pas_chiffre_axes").onchange = () =>
	can.set_pas_chiffre_axes(parseInt((document.getElementById("pas_chiffre_axes") as HTMLInputElement).value));

document.getElementById("taille_points").onmousemove = () => {
	can.set_taille_points(parseInt((document.getElementById("taille_points") as HTMLInputElement).value));
	document.getElementById("span_taille_points").innerHTML = (document.getElementById("taille_points") as HTMLInputElement).value;
}

document.getElementById("taille_traits").onmousemove = () => {
	can.set_taille_traits(parseInt((document.getElementById("taille_traits") as HTMLInputElement).value));
	document.getElementById("span_taille_traits").innerHTML = (document.getElementById("taille_traits") as HTMLInputElement).value;
}

document.getElementById("ok_affichage").onclick = () =>
	can.set_texte_canvas((document.getElementById("text_affichage") as HTMLInputElement).value, parseInt((document.getElementById("temps_affichage") as HTMLInputElement).value));

document.getElementById("zoom_perso").onchange = () =>
	can.set_zoom(parseFloat((document.getElementById("zoom_perso") as HTMLInputElement).value));

document.getElementById("zoom_moins").onclick = () => 
	can.zoom_moins(parseInt((document.getElementById("zoom_vitesse") as HTMLInputElement).value));

document.getElementById("zoom_plus").onclick = () => 
	can.zoom_plus(parseInt((document.getElementById("zoom_vitesse") as HTMLInputElement).value));
