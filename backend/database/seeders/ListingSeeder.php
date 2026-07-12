<?php

namespace Database\Seeders;

use App\Models\Listing;
use App\Models\Neighborhood;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Annonces de démonstration — reprises 1:1 du jeu de données de l'ancien front
 * statique (quartiers, prix réalistes, galeries Unsplash, visite 360°).
 *
 * Chaque propriétaire cité devient un vrai compte (rôle owner, vérifié) afin que
 * la messagerie locataire ⇄ propriétaire soit démontrable de bout en bout.
 * Mot de passe commun : Password123! (dev uniquement).
 */
class ListingSeeder extends Seeder
{
    private const PASSWORD = 'Password123!';

    /** Photos d'intérieur (Unsplash) réutilisées pour composer les galeries. */
    private const INT = [
        '1600607687939-ce8a6c25118c', '1600566753086-00f18fb6b3ea',
        '1600210492486-724fe5c67fb0', '1586023492125-27b2c045efd7',
        '1583847268964-b28dc8f51f92',
    ];

    /** Panoramas 360° d'intérieur auto-hébergés (servis par le front, /pano). */
    private const PANOS = ['/pano/interior-1.jpg', '/pano/interior-3.jpg', '/pano/interior-2.jpg'];

    /**
     * [titre, quartier, type, prix, chambres, sdb, m², note, meublé, durée, premium, lat, lng, photoId, propriétaire]
     */
    private const LISTINGS = [
        ['Appartement 2 pièces moderne au Plateau', 'Plateau', 'Appartement', 400000, 2, 1, 75, 4.8, false, 'longue', true, 14.6708, -17.4381, '1560448204-e02f11c3d0e2', 'Aliou Sarr'],
        ['Villa avec jardin aux Almadies', 'Almadies', 'Villa', 1200000, 4, 3, 220, 4.9, true, 'longue', true, 14.7447, -17.5216, '1600585154340-be6161a56a0c', 'Mareme Gueye'],
        ['Studio meublé lumineux à Mermoz', 'Mermoz', 'Studio', 250000, 1, 1, 38, 4.7, true, 'courte', false, 14.7028, -17.4778, '1522708323590-d24dbb6b0267', 'Cheikh Ba'],
        ['Appartement 3 pièces standing Point E', 'Point E', 'Appartement', 600000, 3, 2, 110, 4.8, false, 'longue', false, 14.6905, -17.4600, '1502672260266-1c1ef2d93688', 'Fatou Ndiaye'],
        ['Chambre confortable en colocation', 'Sacré-Cœur', 'Chambre', 90000, 1, 1, 20, 4.5, true, 'longue', false, 14.7075, -17.4600, '1505693416388-ac5ce068fe85', 'Ousmane Fall'],
        ['Villa vue mer à Ngor', 'Ngor', 'Villa', 1500000, 4, 3, 190, 5.0, true, 'courte', true, 14.7500, -17.5100, '1512917774080-9991f1c4c750', 'Awa Diallo'],
        ['Studio moderne proche plage Ouakam', 'Ouakam', 'Studio', 200000, 1, 1, 34, 4.6, false, 'longue', false, 14.7167, -17.4900, '1493809842364-78817add7ffb', 'Ibrahima Sow'],
        ['Appartement familial spacieux Yoff', 'Yoff', 'Appartement', 500000, 3, 2, 120, 4.7, false, 'longue', false, 14.7550, -17.4700, '1560185007-cde436f6a4d0', 'Ndeye Sy'],
        ['Duplex haut standing Almadies', 'Almadies', 'Appartement', 850000, 3, 2, 140, 4.9, true, 'courte', true, 14.7420, -17.5150, '1512918728675-ed5a9ecdebfd', 'Modou Diop'],
        ['Chambre étudiante proche UCAD', 'Fann', 'Chambre', 75000, 1, 1, 16, 4.4, true, 'longue', false, 14.6870, -17.4620, '1626178793926-22b28830aa30', 'Sokhna Mbaye'],
        ['Appartement neuf à Liberté 6', 'Liberté 6', 'Appartement', 450000, 2, 2, 85, 4.6, false, 'longue', false, 14.7300, -17.4560, '1568605114967-8130f3a36994', 'Pape Gaye'],
        ['Grande villa avec piscine Yoff', 'Yoff', 'Villa', 2200000, 5, 4, 300, 4.9, true, 'longue', true, 14.7560, -17.4720, '1613490493576-7fde63acd811', 'Coumba Faye'],
        ['Studio cosy meublé Sacré-Cœur', 'Sacré-Cœur', 'Studio', 180000, 1, 1, 30, 4.5, true, 'courte', false, 14.7080, -17.4590, '1502005229762-cf1b2da7c5d6', 'Alioune Ndoye'],
        ['Chambre meublée à Grand Yoff', 'Grand Yoff', 'Chambre', 65000, 1, 1, 14, 4.2, true, 'longue', false, 14.7480, -17.4560, '1560448075-bb485b067938', 'Bineta Cissé'],
        ['Appartement meublé aux Almadies', 'Almadies', 'Appartement', 750000, 2, 2, 95, 4.8, true, 'courte', false, 14.7450, -17.5180, '1493809842364-78817add7ffb', 'Serigne Mbacké'],
        ['Villa contemporaine Mermoz', 'Mermoz', 'Villa', 900000, 4, 3, 210, 4.7, false, 'longue', false, 14.7040, -17.4760, '1600596542815-ffad4c1539a9', 'Rama Thiam'],
        ['Studio étudiant proche HLM', 'HLM', 'Studio', 130000, 1, 1, 25, 4.1, false, 'longue', false, 14.7100, -17.4450, '1554995207-c18c203602cb', 'Khadim Lo'],
        ['Appartement lumineux Point E', 'Point E', 'Appartement', 520000, 2, 1, 80, 4.6, true, 'courte', false, 14.6910, -17.4620, '1484154218962-a197022b5858', 'Nafi Diouf'],
    ];

    public function run(): void
    {
        $ownerRoleId = Role::where('name', Role::OWNER)->value('id');
        $neighborhoods = Neighborhood::pluck('id', 'slug'); // slug => id
        $owners = [];

        foreach (self::LISTINGS as $i => $row) {
            [$title, $quartier, $type, $price, $rooms, $sdb, $m2, $note, $meuble, $duree, $premium, $lat, $lng, $photo, $ownerName] = $row;

            // Propriétaire : créé à la volée (une fois), vérifié, rôle owner.
            $ownerId = $owners[$ownerName] ??= $this->ensureOwner($ownerName, $ownerRoleId);

            // Slug déterministe (les titres sont uniques) : updateOrCreate reste
            // idempotent si le seeder est rejoué.
            $slug = Str::slug($title);
            $img = $this->unsplash($photo);

            Listing::updateOrCreate(
                ['slug' => $slug],
                [
                    'owner_id' => $ownerId,
                    'neighborhood_id' => $neighborhoods[Str::slug($quartier)] ?? null,
                    'title' => $title,
                    'description' => $this->description($type, $quartier, $meuble),
                    'type' => $type,
                    'price' => $price,
                    'rooms' => $rooms,
                    'bathrooms' => $sdb,
                    'area' => $m2,
                    'furnished' => $meuble,
                    'duration' => $duree,
                    'is_premium' => $premium,
                    'rating' => $note,
                    'lat' => $lat,
                    'lng' => $lng,
                    'images' => [
                        $img,
                        $this->unsplash(self::INT[$i % count(self::INT)], 600),
                        $this->unsplash(self::INT[($i + 1) % count(self::INT)], 600),
                        $this->unsplash(self::INT[($i + 2) % count(self::INT)], 600),
                    ],
                    'pano' => self::PANOS[$type === 'Villa' ? 2 : ($type === 'Appartement' ? 1 : 0)],
                    'status' => 'published',
                ],
            );
        }
    }

    /** Crée (ou récupère) un compte propriétaire vérifié à partir de son nom. */
    private function ensureOwner(string $name, int $ownerRoleId): int
    {
        $email = Str::slug($name, '.').'@bailleurs.terangaloc.sn';

        // Numéro sénégalais de démo déterministe (pour les boutons Appeler/WhatsApp).
        $phone = '+2217'.str_pad((string) (crc32($name) % 10000000), 7, '0', STR_PAD_LEFT);

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'phone' => $phone,
                'whatsapp' => $phone,
                'instagram' => Str::slug($name, '.'),
                'password' => Hash::make(self::PASSWORD),
                'email_verified_at' => now(),
                'verification_status' => 'verified',
                'verified_at' => now(),
                'locale' => 'fr',
                'is_active' => true,
            ],
        );

        $user->roles()->syncWithoutDetaching([$ownerRoleId]);

        return $user->id;
    }

    private function unsplash(string $id, int $w = 700): string
    {
        return "https://images.unsplash.com/photo-{$id}?w={$w}&q=80&auto=format&fit=crop";
    }

    private function description(string $type, string $quartier, bool $meuble): string
    {
        $etat = $meuble ? 'entièrement meublé et équipé' : 'non meublé, prêt à personnaliser';

        return "Beau {$type} situé à {$quartier}, Dakar. Logement {$etat}, "
            ."dans un quartier calme et bien desservi. Propriétaire vérifié, "
            .'visite 360° disponible. Contactez le bailleur pour organiser une visite.';
    }
}
