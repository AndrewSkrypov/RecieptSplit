package routes

import (
	"go_server/app/handlers/authHandlers"
	"go_server/app/handlers/userHandlers"
	"net/http"

	"github.com/gorilla/mux"
)

func Routes() *mux.Router {
	r := mux.NewRouter()

	base := "/api"

	r.HandleFunc(base+"/register", authHandlers.Register).Methods("POST")
	r.HandleFunc(base+"/login", authHandlers.Login).Methods("POST")
	r.HandleFunc(base+"/logout", authHandlers.Logout).Methods("DELETE")

	r.HandleFunc(base+"/users", authHandlers.Authenticate(userHandlers.GetAllusers)).Methods("GET")
	r.HandleFunc(base+"/users/me", authHandlers.Authenticate(userHandlers.Getuserbyid)).Methods("GET")

	r.HandleFunc(base+"/test", func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte("Hello"))
		if err != nil {
			return
		}
	})
	return r
}
