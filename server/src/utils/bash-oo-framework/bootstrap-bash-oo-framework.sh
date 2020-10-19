#!/usr/bin/env bash
which import
source "$( cd "${BASH_SOURCE[0]%/*}" && pwd )/lib/oo-bootstrap.sh"
unalias '.'
alias .="__oo__allowFileReloading=false System::Import"
which import
#unalias '.'
#alias .="__oo__allowFileReloading=false System::Import"
