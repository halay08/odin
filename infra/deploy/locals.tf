locals {

    secrets      = jsondecode(file("../config/secrets.json"))
    environments = jsondecode(file("../config/environments.json"))
    releases     = jsondecode(file("../config/releases.json"))
    modules      = jsondecode(file("../config/modules.json"))

}
