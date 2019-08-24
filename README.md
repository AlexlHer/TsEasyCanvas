# TsEasyCanvas
## Dessins de graphiques dans canvas HTML en TypeScript.

Projet ayant pour but d'expérimenter TypeScript.

Conversion du canvas utilisé dans le projet Golf (https://tp-ssh1.dep-informatique.u-psud.fr/~alherit/L3S5_projet_web/golf/index.php) en une simple api en TypeScript.

![alt text](Exemple.PNG)

## Compilation
```
tsc canvas.ts
```

## Utilisation

Lancer le .html dans votre navigateur.

Documentation en cours d'écriture.

## Changelog :

### Version Alpha 190824.1 :

- La taille de la liste de points est maintenant liée directement au nombre de couleurs de la liste "couleurs".

- Taille de la liste de points est donc maintenant fixé.

- Ajout des comparaisons de la liste de points avec undefined partout.

- Ajout d'un paramètre after dans add_point() pour pouvoir placer un point après un autre (et donc entre deux points).

- Correction d'un bug au niveau du rectangle_all_point lorsqu'il y a un seul point ou uniquement des points alignés sur x ou y.

- Ajout de la variable "this.nb_courbe_max" au lieu de "this.points.length" ou de la constante 6. Permettra de modifier les couleurs de la liste "couleurs".

- Ajout des méthodes zoom_plus() et zoom_moins(), sortent de molette(e).

- Ajout des vitesses dans les zoom.

- Ajout des touches + et - du clavier pour zoomer et dézoomer.
