
- docker ps (Bilgisayardaki çalışan container'ları listeler)
- docker start ktu-dev-db (containerı başlatır.)
- docker exec -ti ktu-dev-db bash (Container'ın içine girmeyi sağlayan kod)
- psql --help (Şuan containerın içindesin, postgresql'e bağlanan terminal clientı)
- psql -h localhost -p 5432 -W ktu-map -U admin (database'e bağlanılır)
// Veri tabanı sorguları yazılabilir //