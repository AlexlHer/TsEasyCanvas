// Auteur : Alexandre l'Heritier

class Point {
	constructor(public x: number, public y: number) {}

	// Calcul de la position en px dans le repère.
	public x_in_canvas(origine: Array<number>, zoom: number) {
		return origine[0] + this.x * zoom;
	}
	public y_in_canvas(origine: Array<number>, zoom: number) {
		return origine[1] - this.y * zoom;
	}

	public equals(point: Point){
		return point.x === this.x && point.y === this.y;
	}

	public clone(){
		return new Point(this.x, this.y);
	}
}

class Canvas {
	private zoom: 					number 				= 30;
	private taille_points: 			number 				= 2;
	private taille_chiffre: 		number 				= 10;
	private taille_traits: 			number 				= 1;
	private pas_chiffre_axes: 		number 				= 1;
	private pas_auto: 				boolean 			= true;
	private cadrillage: 			boolean 			= false;
	private repere: 				boolean 			= true;
	private texte: 					string 				= "";
	private points: 				Array<Array<Point>>;
	private rectangle_all_points: 	Array<number> 		= new Array<number>(4);
	private clear_info_point: 		boolean 			= false;
	private click: 					boolean 			= false;
	private origine_dorigine: 		Array<number> 		= [0, 0];
	private origine_deplacement: 	Array<number>		= [Number.MAX_VALUE, 0];
	private contx:					CanvasRenderingContext2D;
	private origine: 				Array<number>;
	private nb_courbe_max: 			number;
	private elem_zoom:				HTMLElement	 		= null;

	public constructor(	
		private elem_canvas_doc: HTMLCanvasElement, 
		private couleurs: Array<string> = ["white", "green", "blue", "orange", "red", "purple", "grey"]
		){

		this.contx = this.elem_canvas_doc.getContext("2d");
		this.origine = [this.elem_canvas_doc.width / 2, this.elem_canvas_doc.height / 2];
		this.nb_courbe_max = this.couleurs.length;
		this.points = new Array<Array<Point>>(this.nb_courbe_max);
	}

	private info_point(e: MouseEvent) {
		// Si la liste de point est vide, pas besoin d'aller plus loin.
		if (this.points.every( (a: Array<Point>): boolean => {return a === undefined} )) return;

		// On definit la taille de la zone autour du point.
		let espace_autour = this.taille_points < 5 ? 5 : this.taille_points;

		// Si on a demandé d'effacer un ancien dessin de info_point.
		if (this.clear_info_point) {
			this.reload_all();
			this.clear_info_point = false;
		}

		// On regarde si la souris est bien dans le rectangle contenant tous les points de toutes les courbes.
		// Cela permet d'optimiser la fonction si la souris n'est pas suceptible d'être sur un point car pas dans le rectangle (évite des tours de boucle).
		if (!(e.clientX - this.elem_canvas_doc.offsetLeft > this.rectangle_all_points[0] - espace_autour &&
			e.clientX - this.elem_canvas_doc.offsetLeft < this.rectangle_all_points[2] + espace_autour &&
			e.clientY - this.elem_canvas_doc.offsetTop > this.rectangle_all_points[1] - espace_autour &&
			e.clientY - this.elem_canvas_doc.offsetTop < this.rectangle_all_points[3] + espace_autour)) {
			return;
		}

		// console.log(this.rectangle_all_points);

		// 01-------21
		// |         |
		// 03-------23

		// // Permet de dessiner le rectangle contenant les points.
		// this.contx.beginPath();
		// this.contx.moveTo(this.rectangle_all_points[0] - espace_autour, this.rectangle_all_points[1] - espace_autour);
		// this.contx.lineTo(this.rectangle_all_points[2] + espace_autour, this.rectangle_all_points[1] - espace_autour);
		// this.contx.lineTo(this.rectangle_all_points[2] + espace_autour, this.rectangle_all_points[3] + espace_autour);
		// this.contx.lineTo(this.rectangle_all_points[0] - espace_autour, this.rectangle_all_points[3] + espace_autour);
		// this.contx.lineTo(this.rectangle_all_points[0] - espace_autour, this.rectangle_all_points[1] - espace_autour);
		// this.contx.stroke();
		// this.contx.closePath();

		// Pour toutes les courbes.
		for (let i = 0; i < this.nb_courbe_max; i++) {

			if(this.points[i] !== undefined){

				// Pour tous les points de la courbe i.
				// Pas de forEach car besoin de la pos du point.
				for (let j = 0; j < this.points[i].length; j++) {

					// Si la souris est dans la zone du point [i][j].
					if (this.points[i][j].x_in_canvas(this.origine, this.zoom) + espace_autour >= e.clientX - this.elem_canvas_doc.offsetLeft &&
						this.points[i][j].x_in_canvas(this.origine, this.zoom) - espace_autour < e.clientX - this.elem_canvas_doc.offsetLeft &&
						this.points[i][j].y_in_canvas(this.origine, this.zoom) + espace_autour >= e.clientY - this.elem_canvas_doc.offsetTop &&
						this.points[i][j].y_in_canvas(this.origine, this.zoom) - espace_autour < e.clientY - this.elem_canvas_doc.offsetTop) {

						// On definit une police pour l'affichage des infos.
						this.contx.font = "bold " + 15 + "px Arial";
						this.contx.fillStyle = "white";

						// Le texte à afficher au dessus de la souris.
						let text = "Point n°" + (j + 1).toString();

						// On dessine le texte au dessus de la souris (le -10) et centré (le measureText).
						this.contx.fillText(text,
							e.clientX - this.elem_canvas_doc.offsetLeft - this.contx.measureText(text).width / 2,
							e.clientY - this.elem_canvas_doc.offsetTop - 10);

						// Le texte à afficher en dessous de la souris.
						text = "Position X : " + ((this.points[i][j].x).toFixed(2)).toString() + " - Position Y : " + ((this.points[i][j].y).toFixed(2)).toString();

						// On dessine le texte en dessous de la souris.
						this.contx.fillText(text,
							e.clientX - this.elem_canvas_doc.offsetLeft - this.contx.measureText(text).width / 2,
							e.clientY - this.elem_canvas_doc.offsetTop + 30);

						// On demande d'effacer le texte au prochain appel (permet de ne pas mettre un reload_all qui serai appelé à chaque mouvement de la souris).
						this.clear_info_point = true;
						return;
					}
				}
			}
		}
	}

	public deplace_souris(e: MouseEvent) {

		// On appele info_canvas pour afficher les infos du point (si la souris est sur un point).
		this.info_point(e);

		// Si la souris est déplacée dans le canvas mais que l'utilisateur ne clique
		// pas, on ne fait pas les calculs.
		if (this.click === false) return;

		// Si c'est la première fois que cette méthode est appelé.
		if (this.origine_deplacement[0] == Number.MAX_VALUE) {
			// On enregistre l'emplacement du clique d'origine de l'utilisateur.
			this.origine_deplacement[0] = e.clientX;
			this.origine_deplacement[1] = e.clientY;

			// On enregistre l'emplacement de l'origine d'origine pour pouvoir 
			// faire les calculs.
			this.origine_dorigine[0] = this.origine[0];
			this.origine_dorigine[1] = this.origine[1];
		}

		// La nouvelle origine est l'emplacement de l'origine d'origine + le déplacement
		// de la souris (si on n'enregistre pas l'origine d'origine, le déplacement va 
		// être exponentiel) - le placement de la souris d'origine (pour avoir un déplacement
		// de la souris correct).
		// Remarque : Pour avoir la bonne position de la souris, on doit mettre les offsetLeft
		// et offsetTop du canvas mais ici, on n'a pas besoin de l'emplacement exact de la
		// souris donc on n'inclut pas ça.
		this.origine[0] = this.origine_dorigine[0] + e.clientX - this.origine_deplacement[0];
		this.origine[1] = this.origine_dorigine[1] + e.clientY - this.origine_deplacement[1];

		// On recharge le canvas pour que l'utilisateur puisse visualiser le déplacement.
		this.reload_all();
	}

	public mouseDown() {
		this.click = true;
	}

	public mouseUp() {
		// On remet les max_int pour pouvoir savoir plus tard si c'est la première
		// fois que l'on a appelé deplace_souris().
		this.origine_deplacement = [Number.MAX_VALUE, 0];
		this.click = false;
	}

	public molette(e: WheelEvent) {
		if (e.deltaY > 0) this.zoom_moins();
		else this.zoom_plus();

		// On évite que la molette puisse descendre la page en même temps que le zoom.
		e.preventDefault();
	}

	public zoom_plus(vitesse = 1){
		// Si le zoom actuel est > 10, on ajoute 1 si
		// on veux zoomer et -1 si on veut dézoomer.
		// Si delta > 0, molette vers le bas.
		if (this.zoom >= 10) {
			this.zoom += 1 * vitesse;
		}
		else if (this.zoom >= 1) {
			this.zoom += .5 * vitesse;
		}
		else if (this.zoom >= .1) {
			this.zoom += .1 * vitesse;
		}
		else {
			this.zoom += .01 * vitesse;
		}

		// Pour éviter que des chiffres après la virgule trainent (dans une vitesse 10 par exemple).
		if (this.zoom >= 10) {
			this.zoom = parseFloat(this.zoom.toFixed(0));
		}
		else if (this.zoom >= .1) {
			this.zoom = parseFloat(this.zoom.toFixed(1));
		}
		else {
			this.zoom = parseFloat(this.zoom.toFixed(2));
		}

		// On maj le titre du canvas.
		if (this.elem_zoom != null) {
			this.elem_zoom.innerHTML = "Zoom : x " + this.zoom;
		}

		if (this.pas_auto) {
			this.fpas_auto(true);
		}

		// On recharge le canvas.
		this.reload_all();
	}

	public zoom_moins(vitesse = 1){
		// Si le zoom actuel est > 10, on ajoute 1 si
		// on veux zoomer et -1 si on veut dézoomer.
		// Si delta > 0, molette vers le bas.
		if (this.zoom > 10) {
			this.zoom -= 1 * vitesse;
		}
		// Si le zoom est = 10, on dézoom avec -0.5 et on zoom avec
		// + 1 (se qui permet d'éviter un passage de 10 à 9 sans passer
		// par 9.5).
		else if (this.zoom > 1 || this.zoom == 10) {
			this.zoom -= .5 * vitesse;
		}
		else if (this.zoom > 0.1 || this.zoom == 1) {
			this.zoom -= .1 * vitesse;
		}
		else {
			this.zoom -= .01 * vitesse;
		}

		// Pour éviter que des chiffres après la virgule trainent (dans une vitesse 10 par exemple).
		if (this.zoom > 10) {
			this.zoom = parseFloat(this.zoom.toFixed(0));
		}
		else if (this.zoom > 0.1) {
			this.zoom = parseFloat(this.zoom.toFixed(1));
		}
		else {
			this.zoom = parseFloat(this.zoom.toFixed(2));
		}


		// On limite le dézoom à .01.
		if (this.zoom < .01) this.zoom = .01;

		// On limite le nombre de chiffre après la virgule à 2.
		this.zoom = parseFloat(this.zoom.toFixed(2));

		// On maj le titre du canvas.
		if (this.elem_zoom != null) {
			this.elem_zoom.innerHTML = "Zoom : x " + this.zoom;
		}

		if (this.pas_auto) {
			this.fpas_auto(true);
		}

		// On recharge le canvas.
		this.reload_all();
	}

	private fpas_auto(actualise: boolean) {

		// Si le niveau de zoom est supperieur à 15, on met le pas à 1.
		if (this.zoom > 15) {
			this.pas_chiffre_axes = 1;
		}
		else if (this.zoom > 10) {
			this.pas_chiffre_axes = 2;
		}
		else if (this.zoom > 5) {
			this.pas_chiffre_axes = 5;
		}
		else if (this.zoom > 2) {
			this.pas_chiffre_axes = 10;
		}
		else if (this.zoom > 0.7) {
			this.pas_chiffre_axes = 30;
		}
		else if (this.zoom > 0.2) {
			this.pas_chiffre_axes = 100;
		}
		else if (this.zoom > 0.05) {
			this.pas_chiffre_axes = 500;
		}
		else {
			this.pas_chiffre_axes = 5000;
		}

		// Si on demande l'actualisation du canvas actif.
		if (actualise) this.reload_all();
	}
	
	private effacement_canvas() {
		// On efface tous les élements du select_canvas.
		this.contx.clearRect(0, 0, this.elem_canvas_doc.width, this.elem_canvas_doc.height);
	}

	private dessin_origine() {

		// On défini les couleurs à utiliser pour dessiner le repère.
		this.contx.strokeStyle = "grey";
		this.contx.fillStyle = "white";

		// On défini la taille du trait à 0.5px (pour avoir un effet de transparence).
		this.contx.lineWidth = .5;

		// On défini la police de caractère à utiliser dans le dessin du repere.
		this.contx.font = "bold " + this.taille_chiffre + "px Arial";

		// On commence le dessin.
		this.contx.beginPath();

		// On dessine les deux origines.
		this.contx.moveTo(0, this.origine[1]);
		this.contx.lineTo(this.elem_canvas_doc.width, this.origine[1]);

		this.contx.moveTo(this.origine[0], 0);
		this.contx.lineTo(this.origine[0], this.elem_canvas_doc.height);

		// On dessine l'axe x positif.
		// On fait les graduations a partir de l'origine.
		// Si le zoom est en dessous de x10, on enlève les graduations selon le pas choisi.
		for (var i = this.origine[0]; i < this.elem_canvas_doc.width; i += this.zoom >= 30 ? this.zoom : this.zoom * this.pas_chiffre_axes) {
			// Si on veut un cadrillage, on le dessine.
			if (this.cadrillage) {
				this.contx.moveTo(i, 0);
				this.contx.lineTo(i, this.elem_canvas_doc.height);
			}

			// On dessine les graduations (ici, 5+5=10px.)
			this.contx.moveTo(i, this.origine[1] - 5);
			this.contx.lineTo(i, this.origine[1] + 5);

			// On dessine les nombres à mettre à coté des graduations.
			// (i - origine[0]) : 0 jusqu'a nombre de case - origine[0] (juste un décalage pour que l'on parte de 0).
			// (i - origine[0]) / zoom : comme i vas de (zoom) en (zoom), on divise par (zoom) pour avoir les bons nombres !
			// ((i - origine[0]) / zoom) % pas_chiffre_axes == 0 ? (i - origine[0]) / zoom : "" :
			this.contx.fillText(
				((i - this.origine[0]) / this.zoom) % this.pas_chiffre_axes == 0 ? ((i - this.origine[0]) / this.zoom).toString() : "",
				i - 5,
				this.origine[1] + 5 + 15
			);
		}
		// On dessine l'axe x negatif.
		for (var i = this.origine[0]; i > 0; i -= this.zoom >= 30 ? this.zoom : this.zoom * this.pas_chiffre_axes) {
			if (this.cadrillage) {
				this.contx.moveTo(i, 0);
				this.contx.lineTo(i, this.elem_canvas_doc.height);
			}
			this.contx.moveTo(i, this.origine[1] - 5);
			this.contx.lineTo(i, this.origine[1] + 5);

			this.contx.fillText(
				((i - this.origine[0]) / this.zoom) % this.pas_chiffre_axes == 0 ? ((i - this.origine[0]) / this.zoom).toString() : "",
				i - 5,
				this.origine[1] + 5 + 15
			);
		}

		// On dessine l'axe y positif.
		for (var i = this.origine[1]; i < this.elem_canvas_doc.height; i += this.zoom >= 30 ? this.zoom : this.zoom * this.pas_chiffre_axes) {
			if (this.cadrillage) {
				this.contx.moveTo(0, i);
				this.contx.lineTo(this.elem_canvas_doc.width, i);
			}
			this.contx.moveTo(this.origine[0] - 5, i);
			this.contx.lineTo(this.origine[0] + 5, i);

			this.contx.fillText(
				((i - this.origine[1]) / this.zoom) % this.pas_chiffre_axes == 0 ? (-((i - this.origine[1]) / this.zoom)).toString() : "",
				this.origine[0] + 5 + 5,
				i + 5
			);
		}

		// On dessine l'axe y negatif.
		for (var i = this.origine[1]; i > 0; i -= this.zoom >= 30 ? this.zoom : this.zoom * this.pas_chiffre_axes) {
			if (this.cadrillage) {
				this.contx.moveTo(0, i);
				this.contx.lineTo(this.elem_canvas_doc.width, i);
			}
			this.contx.moveTo(this.origine[0] - 5, i);
			this.contx.lineTo(this.origine[0] + 5, i);

			this.contx.fillText(
				((i - this.origine[1]) / this.zoom) % this.pas_chiffre_axes == 0 ? (-((i - this.origine[1]) / this.zoom)).toString() : "",
				this.origine[0] + 5 + 5,
				i + 5
			);
		}

		// On applique le tout sur le canvas.
		this.contx.stroke();

		// On ferme le dessin.
		this.contx.closePath();
	}

	private dessin_point(p: Point) {
		// On commence le dessin.
		this.contx.beginPath();

		// On dessine un cercle plein sur la position px et de taille defini par l'utilisateur.
		this.contx.arc(p.x_in_canvas(this.origine, this.zoom), p.y_in_canvas(this.origine, this.zoom), this.taille_points, 0, 2 * Math.PI);
		this.contx.fill();

		// On termine le dessin.
		this.contx.closePath();
	}

	private dessin_trait(p1: Point, p2: Point) {
		// On commence le dessin.
		this.contx.beginPath();

		// On déplace le crayon levé sur le point de départ p1.
		this.contx.moveTo(p1.x_in_canvas(this.origine, this.zoom), p1.y_in_canvas(this.origine, this.zoom));

		// On dessine la ligne de p1 vers p2.
		this.contx.lineTo(p2.x_in_canvas(this.origine, this.zoom), p2.y_in_canvas(this.origine, this.zoom));

		// On applique le dessin sur le canvas.
		this.contx.stroke();

		// On termine le dessin.
		this.contx.closePath();
	}

	private dessin_points(p: Array<Point>, coul: string) {

		// On definit la couleur des prochain dessin à coul.
		this.contx.fillStyle = coul;
		this.contx.strokeStyle = coul;

		// On dessine tous les points contenu dans p.
		for (var i = 0; i < p.length; i++) {
			this.dessin_point(p[i]);

			// On verifie si le point est hors du rectangle.
			// Si c'est le cas, on ajuste le rectangle pour inclure le point.
			if (p[i].x_in_canvas(this.origine, this.zoom) < this.rectangle_all_points[0]) {
				this.rectangle_all_points[0] = p[i].x_in_canvas(this.origine, this.zoom);
			}
			if (p[i].x_in_canvas(this.origine, this.zoom) > this.rectangle_all_points[2]) {
				this.rectangle_all_points[2] = p[i].x_in_canvas(this.origine, this.zoom);
			}

			if (p[i].y_in_canvas(this.origine, this.zoom) < this.rectangle_all_points[1]) {
				this.rectangle_all_points[1] = p[i].y_in_canvas(this.origine, this.zoom);
			}
			if (p[i].y_in_canvas(this.origine, this.zoom) > this.rectangle_all_points[3]) {
				this.rectangle_all_points[3] = p[i].y_in_canvas(this.origine, this.zoom);
			}
		}

		// Si l'utilisateur veut le dessin des traits.
		if (this.taille_traits > 0) {
			// On definit la taille des lignes avec taille_traits.
			this.contx.lineWidth = this.taille_traits;

			// Pour tous les points, on dessine la ligne entre p et p+1.
			for (var i = 0; i < p.length - 1; i++) {
				this.dessin_trait(p[i], p[i + 1]);
			}
		}
	}

	private dessin_texte() {

		// Si le texte est vide, pas besoin de dessiner quelque chose.
		if (this.texte == "") return;

		// On défini la police à utiliser.
		this.contx.font = "bold " + 20 + "px Arial";

		// On prend la taille que va faire le texte sur le canvas.
		let w_texte = this.contx.measureText(this.texte).width;

		// On desine le fond du texte (au centre de l'écran, avec une hauteur de 27).
		this.contx.fillStyle = "black";
		this.contx.fillRect(this.elem_canvas_doc.width / 2 - w_texte / 2 - 2, this.elem_canvas_doc.height / 2 - 20, w_texte + 4, 27);

		// On dessine le contour du fond.
		this.contx.strokeStyle = "white";
		this.contx.strokeRect(this.elem_canvas_doc.width / 2 - w_texte / 2 - 2, this.elem_canvas_doc.height / 2 - 20, w_texte + 4, 27);

		// On dessine le texte.
		this.contx.fillStyle = "white";
		this.contx.fillText(this.texte, this.elem_canvas_doc.width / 2 - w_texte / 2, this.elem_canvas_doc.height / 2);
	}

	// public async titre_canvas() {
	// 	// On sauvegarde le niveau de zoom qui est dans le titre.
	// 	let save = document.getElementById("span_super_dezoom").innerHTML;

	// 	// Après 2 secondes.
	// 	setTimeout(function () {
	// 		// Si le niveau de zoom est le même (Donc s'il n'a pas été modifié une autre fois,
	// 		// ce qui permet de le laisser si titre_canvas a été appelé une autre fois).
	// 		if (document.getElementById("span_super_dezoom").innerHTML == save) {
	// 			// On affiche le canvas actif dans le titre du canvas.
	// 			document.getElementById("span_super_dezoom").innerHTML = "Canvas " + canvas_actif.charAt(1);
	// 		}
	// 	}, 2000);
	// }

	public origine_au_centre(){
		this.origine = [this.elem_canvas_doc.width/2, this.elem_canvas_doc.height/2];
		this.reload_all();
		return true;
	}

	public reload_all() {

		// On efface tous ce qu'il y a dans le canvas.
		this.effacement_canvas();

		// Si l'utilisateur veut un repère dans le canvas.
		if (this.repere) {
			// On dessine le repère.
			this.dessin_origine();
		}

		// On remet à zero le rectangle des points.
		this.rectangle_all_points = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE];

		// On dessine tous les points contenu dans le tableau point du canvas.
		for (var i = 0; i < this.nb_courbe_max; i++) {
			if (this.points[i] !== undefined){
				this.dessin_points(this.points[i], this.couleurs[i]);
			}
		}

		// On dessine le texte du canvas.
		this.dessin_texte();
	}

	public async set_texte_canvas(texte: string, time: number) {
		// On met le texte dans l'objet canvas (et on remplace l'ancien exte s'il y en a un).
		this.texte = texte;

		// On recharge le canvas pour afficher le texte (c'est dessin_texte() qui s'en occupe).
		this.reload_all();

		// Après time millisecondes.
		setTimeout(() => {
			// Si le texte est le même que celui qu'on a laissé.
			if (this.texte == texte) {
				// On vide le texte.
				this.texte = "";
				// On recharge le canvas.
				this.reload_all();
			}
		}, time);
	}

	public set_size_canvas(width: number, height: number) {

		if (width !== -1) {
			this.elem_canvas_doc.setAttribute('style', "width: " + width.toString() + "px");
		}

		if (height !== -1) {
			this.elem_canvas_doc.setAttribute('style', "height: " + height.toString() + "px");
		}

		// Comme on a mis "width: 100%" dans le css, on recupère la taille du canvas (idem height).
		// On est forcé de faire ça pour éviter de faire un zoom sur le canvas.
		this.elem_canvas_doc.setAttribute('width', (this.elem_canvas_doc.clientWidth).toString() + "px");
		this.elem_canvas_doc.setAttribute('height', (this.elem_canvas_doc.clientHeight).toString() + "px");

		// Pour éviter que la taille des chiffres revienne par défaut.
		// (fonction dans change_canvas.js)
		// this.change_taille_chiffre_axes();

		// On recharge le canvas pour réafficher les éléments qui etaient dessus.
		this.reload_all();
	}

	public set_zoom(val: number){
		if(val < 0.01) return false;
		this.zoom = val;

		if (this.zoom >= 10) {
			this.zoom = parseFloat(this.zoom.toFixed(0));
		}
		else if (this.zoom >= .1) {
			this.zoom = parseFloat(this.zoom.toFixed(1));
		}
		else {
			this.zoom = parseFloat(this.zoom.toFixed(2));
		}

		if (this.elem_zoom != null){
			this.elem_zoom.innerHTML = "Zoom : x " + this.zoom;
		}

		if (this.pas_auto) {
			this.fpas_auto(true);
		}

		this.reload_all();
		return true;
	}

	public get_zoom() {
		return this.zoom;
	}

	public set_taille_points(val: number) {
		if(val < 0 || val > 15) return false;
		this.taille_points = val;
		this.reload_all();
		return true;
	}

	public get_taille_points() {
		return this.taille_points;
	}

	public set_taille_chiffre(val: number) {
		if (val < 5 || val > 25) return false;
		this.taille_chiffre = val;
		this.reload_all();
		return true;
	}

	public get_taille_chiffre() {
		return this.taille_chiffre;
	}

	public set_taille_traits(val: number) {
		if (val < 0 || val > 5) return false;
		this.taille_traits = val;
		this.reload_all();
		return true;
	}

	public get_taille_traits() {
		return this.taille_traits;
	}

	public set_pas_chiffre_axes(val: number) {
		if (val < 1 || val > 10000) return false;
		this.pas_chiffre_axes = val;
		this.reload_all();
		return true;
	}

	public get_pas_chiffre_axes() {
		return this.pas_chiffre_axes;
	}

	public set_pas_auto(val: boolean) {
		this.pas_auto = val;
		this.fpas_auto(true);
		return true;
	}

	public get_pas_auto() {
		return this.pas_chiffre_axes;
	}

	public set_affiche_cadrillage(val: boolean) {
		this.cadrillage = val;
		this.reload_all();
		return true;
	}

	public get_affiche_cadrillage() {
		return this.cadrillage;
	}

	public set_affiche_repere(val: boolean) {
		this.repere = val;
		this.reload_all();
		return true;
	}

	public get_affiche_repere() {
		return this.repere;
	}

	public set_points(val: Array<Array<Point>>){
		this.points = val;
		this.reload_all();
		return true;
	}

	public get_points(){
		return this.points;
	}

	private indexOfPoint(point: Point, array: Array<Point>){
		for(let i = 0; i < array.length; i++){
			if(point.equals(array[i]))
				return i;
		}
		return -1;
	}

	public add_point(pos: number, point: Point, after?: Point){
		if (pos < 0 || pos > this.nb_courbe_max) return false;
		if (this.points[pos] === undefined) this.points[pos] = new Array<Point>();
		if(after){
			let pos_after: number = this.indexOfPoint(after, this.points[pos]);
			if(pos_after === -1) return false;
			this.points[pos].splice(pos_after+1, 0, point);
		}
		else{
			this.points[pos].push(point);
		}
		this.reload_all();
		return true;
	}

	public add_points(pos: number, points: Array<Point>){
		if (pos < 0 || pos > this.nb_courbe_max) return false;

		if (this.points[pos] === undefined) {
			this.points[pos] = points;
			return true;
		}
		else {
			points.forEach(point => {
				this.points[pos].push(point);
			});
		}
		this.reload_all();
		return true;
	}

	public rem_point(pos: number, point: Point){
		if (this.points[pos] === undefined) return false;

		for(let i = 0; i < this.points[pos].length; i++){
			if(this.points[pos][i].equals(point)){
				this.points[pos].splice(i, 1);
				this.reload_all();
				return true;
			}
		}
		return false;
	}

	public rem_all_iter_point(pos: number, point: Point){
		while(!this.rem_point(pos, point)){}
		return true;
	}

	public replace_points(pos: number, points: Array<Point>){
		this.points[pos] = points;
		this.reload_all();
		return true;
	}

	public clear_all_points(){
		this.points = new Array<Array<Point>>(this.nb_courbe_max);
		this.reload_all();
		return true;
	}

	public clear_points(pos: number){
		this.points.splice(pos, 1);
		this.reload_all();
		return true;
	}

	public set_elem_affichage_zoom(elem: HTMLElement){
		this.elem_zoom = elem;
		this.elem_zoom.innerHTML = "Zoom : x " + this.zoom;
		return true;
	}

	public set_couleurs(elem: Array<string>){
		this.couleurs = elem;
		return true;
	}

	public get_couleurs(){
		return this.couleurs;
	}
}

function init_canvas(id_canvas: string) {
	let elem_canvas: HTMLCanvasElement = document.getElementById(id_canvas) as HTMLCanvasElement;

	let can: Canvas = new Canvas(elem_canvas);

	function resize() {
		let dessusdessous = 300;
		can.set_size_canvas(-1, window.innerHeight - dessusdessous);
	}

	window.onresize = () => resize();

	// Si on appuie sur une touche...
	window.addEventListener("keydown", (event) => {
		// ... et que cette touche est la touche "+", on
		// zoom (voir la fonction molette()).
		if (event.key == "+") {
			can.zoom_plus(10);
		}

		// Et si c'est la touche "-", on dézoom.
		else if (event.key == "-") {
			can.zoom_moins(10);
		}

	}, true);

	elem_canvas.onmousemove = (e: MouseEvent) => can.deplace_souris(e);
	elem_canvas.onmousedown = () => can.mouseDown();
	elem_canvas.onmouseup = () => can.mouseUp();
	elem_canvas.onwheel = (e: WheelEvent) => can.molette(e);

	resize();

	return can;
}