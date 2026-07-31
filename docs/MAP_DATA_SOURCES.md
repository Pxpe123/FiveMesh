# Map data sources

FiveMesh keeps map artwork, location data, and routing data separate so every
dataset can be replaced or updated without rewriting the map page.

## Map artwork

The current Roadmap, Satellite, and Atlas layers use selected zoom-level tiles
from [CreepPork/GTAV-Maps](https://github.com/CreepPork/GTAV-Maps), distributed
under the MIT License.

The copied license is stored at:

```text
apps/web/public/maps/GTAV-MAPS-LICENSE.txt
```

Only the two tiles required for the current full-world view are included for
each layer. Higher zoom levels can be added later through a proper tile loader
instead of shipping the entire source repository in the initial bundle.

## Important locations

The first important-location set is a small manually curated FiveMesh dataset.
It is not copied from MapGenie or gta-5-map.com. Locations are stored as plain
world coordinates in:

```text
apps/web/src/features/map/mapLocations.ts
```

The data contract supports an ID, display name, category, and X/Y/Z position.
Future sources can be normalized into that same structure.

## Personal markers

Custom markers are saved only in the visitor's browser using `localStorage`.
They are not sent to the FiveMesh server and are not included in map analytics.
The stored document is versioned so future releases can migrate it safely.

Each marker records a name, an icon choice, and its X/Y/Z position. The current
icon set covers everyday places, public services, and roleplay activity such as
weed grows, weapon stashes, drops, and robberies.

## Why gta-5-map.com is not scraped

The site blocks automated access through its robots policy, and its map and
location database are operated as a proprietary MapGenie product. FiveMesh does
not copy or republish that database without an export license or written
permission.

If a licensed MapGenie export becomes available, it should be imported through
a separate adapter that records the source and license. The existing map should
continue to work when that optional dataset is absent.

## Future authoritative sources

For a local GTA V installation, the preferred long-term source is the game data
the user has explicitly selected:

- `.ynd` traffic paths for the driving graph
- YMAP/YTYP data for placements and archetypes
- zone data for named regions
- user or server resource manifests for custom blips

The Engine should normalize these sources into versioned JSON or binary map
tiles. The browser should never scrape a third-party map service at runtime.
