package userHandlers

import (
	"encoding/json"
	"go_server/db"
	"go_server/db/model/userModel"
	"net/http"
	"time"
)

type ResponseUser struct {
	ID    uint
	Name  string
	Email string

	CreatedAt time.Time
	UpdatedAt time.Time
}

func GetAllusers(w http.ResponseWriter, r *http.Request) {
	var listUsers []userModel.User

	err := db.DB.Find(&listUsers).Error
	if err != nil {
		http.Error(w, "Ошибка получения пользователей", http.StatusInternalServerError)
		return
	}

	var responseUsers []ResponseUser
	for _, user := range listUsers {
		responseUsers = append(responseUsers, ResponseUser{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,

			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		})
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(responseUsers)
	if err != nil {
		http.Error(w, "Ошибка кодирования JSON", http.StatusInternalServerError)
		return
	}
}

func Getuserbyid(w http.ResponseWriter, r *http.Request) {
	var user userModel.User
	UserID := r.Context().Value("UserID").(uint)

	err := db.DB.Where("id = ?", UserID).First(&user).Error
	if err != nil {
		http.Error(w, "Ошибка получения пользователя", http.StatusNotFound)
		return
	}

	responseUser := ResponseUser{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,

		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(responseUser)
	if err != nil {
		http.Error(w, "Ошибка кодирования данных", http.StatusInternalServerError)
		return
	}
}
