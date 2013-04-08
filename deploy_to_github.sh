#!/bin/bash
# Refer to http://octopress.org/docs/deploying/github/ for more information
# and http://www.linuxcommand.org/wss0130.php, for more information about shell script

# system_page - A script to produce a system information HTML file

##### Constants

TITLE="System Information for $HOSTNAME"
RIGHT_NOW=$(date +"%x %r %Z")
TIME_STAMP="Updated on $RIGHT_NOW by $USER"

##### Functions

function update_source
{
    echo "Updating Source"
    git add .
    git commit -m "$comment"
    git push origin source

} # end of update_source


function deploy_site
{
    echo "Generating site"
    rake generate
    echo "Deplying site"
    rake deploy
} # end of deploy_site


function do_actions
{
    deploy_site

    if [ "$source_update" = "1" ]; then
        update_source
    fi
}

function usage
{
    echo "usage: system_page [[[-c comment ] [-s]] | [-h]]"
}


##### Main

source_update=
comment="Automatic Code Update"

while [ "$1" != "" ]; do
    case $1 in
        -m | --comment )        shift
                                comment=$1
                                ;;
        -s | --source_update )   source_update=1
                                ;;
        -h | --help )           usage
                                exit
                                ;;
        * )                     usage
                                exit 1
    esac
    shift
done


# Test code to verify command line processing

if [ "$source_update" = "1" ]; then
    echo "source_update is on, and comment will be $comment"
else
    echo "source_update is off"
fi
echo "output file = $source_update"

# Perform the actions
do_actions
