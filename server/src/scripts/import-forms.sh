#!/bin/bash
# Run this from within the home folder of the root (ubuntu) user

username=''
password=''
instance=''
server=''
group=''
forms=''
target=''
verbose=false
dry_run=false
execute=true

print_usage() {
  cat <<EOM
    Usage:
        $(basename $0)
    -d  DRY_RUN:    Do not execute; implicitly invokes -v
    -v  VERBOSE:    Echo parameters to console
    -i  INSTANCE:   Name of the Docker container running the Tangerine "server"   
    -u  USERNAME:   Username providing access to the Tangerine instance   
    -p  PASSWORD:   Password corresponding to the USERNAME  
    -s  SERVER:     Public URL at which the Tangerine server is accessed by users
    -g  GROUP:      ID corresponding to the GROUP
                        from which the instrument is being transferred (source)
    -t  TARGET:     ID corresponding to the TARGET group
                        to which the instrument will be transferred (destination)
    -f  FORM:       ID corresponding to the FORM to be transferred (payload).
                        Multiple forms can be passed by invoking
                        '-f {form-id-here}' several times
    e.g.
        $ ./$(basename $0) -d
            -i YOUR-DOCKER-INSTANCE
            -u YOUR-USERNAME
            -p YOUR-PASSWORD
            -s YOUR-PREFIX.tangerinecentral.org
            -g UUID-OF-SOURCE-GROUP
            -t UUID-OF-TARGET-GROUP
            -f UUID-OF-FIRST-FORM
            -f UUID-OF-SECOND-FORM
            -f UUID-OF-THIRD-FORM
    ...would yield...
        sudo docker exec YOUR-DOCKER-INSTANCE import-v2-assessment https://YOUR-USERNAME:YOUR-PASSWORD@YOUR-PREFIX.tangerinecentral.org/db/UUID-OF-SOURCE-GROUP FORM-UUID UUID-OF-TARGET-GROUP
    ...for each -f supplied.
EOM
exit 0
}

if [[ $# == 0 ]]; then
    print_usage
fi

while getopts 'dvi:u:p:s:g:t:f:' opt; do
  case "${opt}" in
    i) instance="${OPTARG}" ;;
    u) username="${OPTARG}" ;;
    p) password="${OPTARG}" ;;
    s) server="${OPTARG}" ;;
    g) group="${OPTARG}" ;;
    t) target="${OPTARG}" ;;
    f) forms+=($OPTARG) ;;
    d) dry_run='true' ;
       verbose='true' ;
       execute='false' ;;
    v) verbose='true' ;;
    *) print_usage ;
       exit 1 ;;
  esac
done
shift $((OPTIND -1))

# echo "${assessments[@]}"

if [[ "$verbose" == "true" ]]; then
    echo ">> Docker container:  [${instance}]" 
    echo ">> Username:          [${username}]" 
    echo ">> Password:          [${password}]" 
    echo ">> Source server:     [${server}]"
    echo ">> Source group ID:   [${group}]" 
    echo ">> Target group ID:   [${target}]" 
    echo ">> Form IDs to move:  [${forms[@]}]" 
fi

if [[ "$execute" == "true" ]]; then
    for form in ${forms[@]}
    do
        # echo " - $form"
        sudo docker exec ${instance} import-v2-assessment https://${username}:${password}@${server}/db/${group} ${form} ${target}
    done
fi

# https://askubuntu.com/questions/674333/how-to-pass-an-array-as-function-argument
# https://stackoverflow.com/questions/687780/documenting-shell-scripts-parameters