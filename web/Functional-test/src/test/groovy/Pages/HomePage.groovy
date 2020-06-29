import geb.Page
import java.util.regex.*

class HomePage extends Page {
  static at = { title == "Secure Sign" }

  static content = {
    loginButton { $("button.auth-button") }
  }
}
