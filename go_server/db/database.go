package db

import (
	"fmt"
	"go_server/db/model/userModel"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	DB            *gorm.DB
	migrationBool bool
)

func ConnectDB(dsn string) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}

	migrationBool = true
	if migrationBool {
		err = db.AutoMigrate(
			&userModel.User{},
		)
	}

	if err != nil {
		log.Fatal("Ошибка миграции:", err)
	}

	DB = db
	fmt.Println("База данных подключена и таблицы созданы!")
}
